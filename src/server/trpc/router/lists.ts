import { protectedProcedure, router } from '../trpc';
import { zNewListSchema } from '../../../schemas/newListSchema';

export const listsRouter = router({
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
