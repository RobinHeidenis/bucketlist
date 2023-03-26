import type { createTRPCContext } from '../trpc';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import {
  zEditListItemSchema,
  zNewListItemSchema,
} from '../../../schemas/listSchemas';
import { TRPCError } from '@trpc/server';
import type { List, User } from '@prisma/client';

const checkAccess = (
  ctx: Awaited<ReturnType<typeof createTRPCContext>>,
  list: Partial<List & { collaborators: Pick<User, 'id'>[] }>,
) =>
  list.ownerId === ctx.session?.user?.id ||
  list.collaborators?.some((c) => c.id === ctx.session?.user?.id);

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
        select: { ownerId: true, collaborators: { select: { id: true } } },
      });

      if (!list)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            "The list you're trying to update an item on cannot be found.",
        });

      if (!checkAccess(ctx, list))
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not allowed to update this item.',
        });

      return ctx.prisma.bucketListItem.update({
        where: { id: input.id },
        data: { checked: input.checked },
      });
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

      if (!list)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The list you're trying to add an item to cannot be found.",
        });

      if (!checkAccess(ctx, list))
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not allowed to add items to this list.',
        });

      if (list.type !== 'BUCKET')
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You can only add bucket list items to this list.',
        });

      return ctx.prisma.bucketListItem.create({
        data: {
          title: input.title,
          description: input.description,
          list: { connect: { id: input.listId } },
        },
      });
    }),
  deleteItem: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const listItem = await ctx.prisma.bucketListItem.findUnique({
        where: { id: input.id },
        select: {
          list: {
            select: { ownerId: true, collaborators: { select: { id: true } } },
          },
        },
      });

      if (!listItem)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The item you're requesting to delete cannot be found.",
        });

      if (!checkAccess(ctx, listItem.list))
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not allowed to delete this item',
        });

      return ctx.prisma.bucketListItem.delete({
        where: { id: input.id },
      });
    }),
  updateItem: protectedProcedure
    .input(zEditListItemSchema)
    .mutation(async ({ ctx, input }) => {
      const listItem = await ctx.prisma.bucketListItem.findUnique({
        where: { id: input.id },
        select: {
          list: {
            select: { ownerId: true, collaborators: { select: { id: true } } },
          },
        },
      });

      if (!listItem)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The item you're requesting to update cannot be found.",
        });

      if (!checkAccess(ctx, listItem.list))
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not allowed to update this item',
        });

      return ctx.prisma.bucketListItem.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
        },
      });
    }),
});
