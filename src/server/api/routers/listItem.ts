import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';

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
});
