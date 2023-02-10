import {
  zEditListSchema,
  zIdSchema,
  zNewListSchema,
  zSetIsPublicSchema,
} from '../../../schemas/listSchemas';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const listsRouter = createTRPCRouter({
  getLists: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.list.findMany({
      where: { ownerId: ctx.session.user.id },
      include: { items: true },
      orderBy: { title: 'asc' },
    });
  }),
  getList: protectedProcedure.input(zIdSchema).query(async ({ ctx, input }) => {
    const list = await ctx.prisma.list.findUnique({
      where: { id: input.id },
      include: { items: { orderBy: { title: 'asc' } }, owner: true },
    });

    if (!list)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: "The list you're requesting cannot be found.",
      });

    if (list.ownerId !== ctx.session.user.id && !list.isPublic)
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You do not have access to view this list.',
      });

    return list;
  }),
  createList: protectedProcedure
    .input(zNewListSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.list.create({
        data: {
          title: input.title,
          description: input.description,
          ownerId: ctx.session.user.id,
        },
      });
    }),
  deleteList: protectedProcedure
    .input(zIdSchema)
    .mutation(async ({ ctx, input }) => {
      const requestedList = await ctx.prisma.list.findUnique({
        where: { id: input.id },
      });

      if (!requestedList)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The list you're requesting to delete cannot be found.",
        });
      if (requestedList.ownerId !== ctx.session.user.id)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You do not have access to delete this list.',
        });

      return ctx.prisma.list.delete({
        where: { id: input.id },
      });
    }),
  updateList: protectedProcedure
    .input(zEditListSchema)
    .mutation(async ({ ctx, input }) => {
      const requestedList = await ctx.prisma.list.findUnique({
        where: { id: input.id },
      });

      if (!requestedList)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The list you're requesting to update cannot be found.",
        });
      if (requestedList.ownerId !== ctx.session.user.id)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You do not have access to update this list.',
        });

      return ctx.prisma.list.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
        },
      });
    }),
  setPublic: protectedProcedure
    .input(zSetIsPublicSchema)
    .mutation(async ({ ctx, input }) => {
      const requestedList = await ctx.prisma.list.findUnique({
        where: { id: input.id },
      });

      if (!requestedList)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The list you're requesting to update cannot be found.",
        });
      if (requestedList.ownerId !== ctx.session.user.id)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You do not have access to update this list.',
        });

      return ctx.prisma.list.update({
        where: { id: input.id },
        data: {
          isPublic: input.isPublic,
        },
      });
    }),
});
