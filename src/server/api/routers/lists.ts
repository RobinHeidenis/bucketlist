import { zNewListSchema } from '../../../schemas/newListSchema';
import { createTRPCRouter, protectedProcedure } from '../trpc';

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
      const { title, description } = zNewListSchema.parse(input);
      return ctx.prisma.list.create({
        data: {
          title,
          description,
          ownerId: ctx.session.user.id,
        },
      });
    }),
});
