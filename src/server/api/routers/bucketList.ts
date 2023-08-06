import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { zEditListItemSchema, zNewListItemSchema } from '~/schemas/listSchemas';
import { TRPCError } from '@trpc/server';
import { checkIfExistsAndAccess } from '~/server/utils/checkIfExistsAndAccess';

export const bucketListRouter = createTRPCRouter({
  setItemChecked: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        listId: z.string().uuid(),
        checked: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.listId },
        select: {
          ownerId: true,
          type: true,
          collaborators: { select: { id: true } },
        },
      });

      checkIfExistsAndAccess(ctx, list, 'BUCKET');

      const item = await ctx.prisma.bucketListItem.findUnique({
        where: { id: input.id },
        select: { checked: true },
      });

      if (!item)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The item you're requesting to update cannot be found.",
        });

      const [updatedList] = await ctx.prisma.$transaction([
        ctx.prisma.bucketListItem.update({
          where: { id: input.id },
          data: { checked: input.checked },
        }),
        ctx.prisma.list.update({
          where: { id: input.listId },
          data: { updatedAt: new Date() },
        }),
      ]);

      return updatedList;
    }),
  createItem: protectedProcedure
    .input(zNewListItemSchema)
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.listId },
        select: {
          ownerId: true,
          collaborators: { select: { id: true } },
          type: true,
        },
      });

      checkIfExistsAndAccess(ctx, list, 'BUCKET');

      const [createdItem] = await ctx.prisma.$transaction([
        ctx.prisma.bucketListItem.create({
          data: {
            title: input.title,
            description: input.description,
            list: { connect: { id: input.listId } },
          },
        }),
        ctx.prisma.list.update({
          where: { id: input.listId },
          data: { updatedAt: new Date() },
        }),
      ]);

      return createdItem;
    }),
  deleteItem: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const listItem = await ctx.prisma.bucketListItem.findUnique({
        where: { id: input.id },
        select: {
          list: {
            select: {
              ownerId: true,
              type: true,
              collaborators: { select: { id: true } },
              id: true,
            },
          },
        },
      });

      if (!listItem)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The item you're requesting to delete cannot be found.",
        });

      checkIfExistsAndAccess(ctx, listItem.list, 'BUCKET');

      const [deletedItem] = await ctx.prisma.$transaction([
        ctx.prisma.bucketListItem.delete({
          where: { id: input.id },
        }),
        ctx.prisma.list.update({
          where: { id: listItem.list.id },
          data: { updatedAt: new Date() },
        }),
      ]);

      return deletedItem;
    }),
  updateItem: protectedProcedure
    .input(zEditListItemSchema)
    .mutation(async ({ ctx, input }) => {
      const listItem = await ctx.prisma.bucketListItem.findUnique({
        where: { id: input.id },
        select: {
          list: {
            select: {
              ownerId: true,
              type: true,
              collaborators: { select: { id: true } },
            },
          },
        },
      });

      if (!listItem)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The item you're requesting to update cannot be found.",
        });

      checkIfExistsAndAccess(ctx, listItem.list, 'BUCKET');

      const [updatedItem] = await ctx.prisma.$transaction([
        ctx.prisma.bucketListItem.update({
          where: { id: input.id },
          data: {
            title: input.title,
            description: input.description,
          },
        }),
        ctx.prisma.list.update({
          where: { id: input.listId },
          data: { updatedAt: new Date() },
        }),
      ]);

      return updatedItem;
    }),
});
