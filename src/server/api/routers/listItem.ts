import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import {
  zEditListItemSchema,
  zIdSchema,
  zNewListItemSchema,
} from '../../../schemas/listSchemas';
import { TRPCError } from '@trpc/server';
import type { User } from '@prisma/client';

const checkAccess = (
  sessionId: string,
  ownerId: string,
  collaborators: User[],
) => ownerId === sessionId || collaborators.some((c) => c.id === sessionId);

export const listItemRouter = createTRPCRouter({
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
        select: { ownerId: true, collaborators: true },
      });

      if (!list)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            "The list you're trying to update an item on cannot be found.",
        });

      if (!checkAccess(ctx.session.user.id, list.ownerId, list.collaborators))
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not allowed to update this item.',
        });

      return ctx.prisma.listItem.update({
        where: { id: input.id },
        data: { checked: input.checked },
      });
    }),
  createItem: protectedProcedure
    .input(zNewListItemSchema)
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.listId },
        select: { ownerId: true, collaborators: true },
      });

      if (!list)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The list you're trying to add an item to cannot be found.",
        });

      if (!checkAccess(ctx.session.user.id, list.ownerId, list.collaborators))
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not allowed to add items to this list.',
        });

      return ctx.prisma.listItem.create({
        data: {
          title: input.title,
          description: input.description,
          list: { connect: { id: input.listId } },
        },
      });
    }),
  deleteItem: protectedProcedure
    .input(zIdSchema)
    .mutation(async ({ ctx, input }) => {
      const listItem = await ctx.prisma.listItem.findUnique({
        where: { id: input.id },
        select: { list: { select: { ownerId: true, collaborators: true } } },
      });

      if (!listItem)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The item you're requesting to delete cannot be found.",
        });

      if (
        !checkAccess(
          ctx.session.user.id,
          listItem.list.ownerId,
          listItem.list.collaborators,
        )
      )
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not allowed to delete this item',
        });

      return ctx.prisma.listItem.delete({
        where: { id: input.id },
      });
    }),
  updateItem: protectedProcedure
    .input(zEditListItemSchema)
    .mutation(async ({ ctx, input }) => {
      const listItem = await ctx.prisma.listItem.findUnique({
        where: { id: input.id },
        select: { list: { select: { ownerId: true, collaborators: true } } },
      });

      if (!listItem)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The item you're requesting to update cannot be found.",
        });

      if (
        !checkAccess(
          ctx.session.user.id,
          listItem.list.ownerId,
          listItem.list.collaborators,
        )
      )
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not allowed to update this item',
        });

      return ctx.prisma.listItem.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
        },
      });
    }),
});
