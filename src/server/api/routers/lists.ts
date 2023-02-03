import { zIdSchema, zNewListSchema } from '../../../schemas/listSchemas';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';

export const listsRouter = createTRPCRouter({
  getLists: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.list.findMany({
      where: { ownerId: ctx.session.user.id },
      include: { items: true },
    });
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
  getList: protectedProcedure.input(zIdSchema).query(({ ctx, input }) => {
    return ctx.prisma.list.findUnique({
      where: { id: input.id },
      include: { items: true, owner: true },
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
});
