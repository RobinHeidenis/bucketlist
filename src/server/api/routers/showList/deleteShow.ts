import { z } from 'zod';
import { checkIfExistsAndAccess } from '~/server/utils/checkIfExistsAndAccess';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

const zDeleteShowSchema = z.object({
  showId: z.number(),
  listId: z.string().uuid(),
});

export const deleteShow = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zDeleteShowSchema>;
}) => {
  const list = await ctx.prisma.list.findUnique({
    where: { id: input.listId },
    select: {
      ownerId: true,
      type: true,
      collaborators: { select: { id: true } },
    },
  });

  checkIfExistsAndAccess(ctx, list, 'SHOW');

  const [updatedList] = await ctx.prisma.$transaction([
    ctx.prisma.list.update({
      where: { id: input.listId },
      data: {
        shows: {
          disconnect: { id: input.showId },
        },
        updatedAt: new Date(),
      },
    }),
    ctx.prisma.checkedEpisode.deleteMany({
      where: {
        AND: [
          { listId: input.listId },
          { episode: { season: { showId: input.showId } } },
        ],
      },
    }),
  ]);

  return updatedList;
};

export const deleteShowProcedure = protectedProcedure
  .input(zDeleteShowSchema)
  .mutation(deleteShow);
