import type { z } from 'zod';
import { checkIfExistsAndAccess } from '~/server/utils/checkIfExistsAndAccess';
import { toggleListItemCheckedSchema } from '~/schemas/toggleListItemCheckedSchema';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

export const setMovieWatched = async ({
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

  checkIfExistsAndAccess(ctx, list, 'MOVIE');

  return await ctx.prisma.$transaction(async (prisma) => {
    await prisma.list.update({
      where: { id: input.listId },
      data: { updatedAt: new Date() },
    });

    if (input.checked) {
      return prisma.checkedMovie.create({
        data: {
          list: { connect: { id: input.listId } },
          movie: { connect: { id: input.id } },
        },
      });
    } else {
      return prisma.checkedMovie.delete({
        where: {
          movieId_listId: { listId: input.listId, movieId: input.id },
        },
      });
    }
  });
};

export const setMovieWatchedProcedure = protectedProcedure
  .input(toggleListItemCheckedSchema)
  .mutation(setMovieWatched);
