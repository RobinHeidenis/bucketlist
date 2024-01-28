import type { z } from 'zod';
import { toggleListItemCheckedSchema } from '~/schemas/toggleListItemCheckedSchema';
import { checkIfExistsAndAccess } from '~/server/utils/checkIfExistsAndAccess';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

export const setEpisodeWatched = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof toggleListItemCheckedSchema>;
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

  return await ctx.prisma.$transaction(async (prisma) => {
    await prisma.list.update({
      where: { id: input.listId },
      data: { updatedAt: new Date() },
    });

    if (input.checked) {
      return prisma.checkedEpisode.create({
        data: {
          list: { connect: { id: input.listId } },
          episode: { connect: { id: input.id } },
        },
      });
    } else {
      return prisma.checkedEpisode.delete({
        where: {
          episodeId_listId: { listId: input.listId, episodeId: input.id },
        },
      });
    }
  });
};

export const setEpisodeWatchedProcedure = protectedProcedure
  .input(toggleListItemCheckedSchema)
  .mutation(setEpisodeWatched);
