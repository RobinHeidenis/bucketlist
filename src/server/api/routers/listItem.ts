import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { zNewListItemSchema } from '../../../schemas/listSchemas';

export const listItemRouter = createTRPCRouter({
  setItemChecked: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        checked: z.boolean(),
      }),
    )
    .mutation(({ ctx, input }) => {
      return ctx.prisma.listItem.update({
        where: { id: input.id },
        data: { checked: input.checked },
      });
    }),
  createItem: protectedProcedure
    .input(zNewListItemSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.listItem.create({
        data: {
          title: input.title,
          description: input.description,
          list: { connect: { id: input.listId } },
        },
      });
    }),
});
