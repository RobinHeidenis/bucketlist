import { zNewListSchema } from '../../../schemas/newListSchema';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';

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
  getList: protectedProcedure
    .input(z.string().uuid())
    .query(({ ctx, input }) => {
      return ctx.prisma.list.findUnique({
        where: { id: input },
        include: { items: true, owner: true },
      });
    }),
});
