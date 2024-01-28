import { z } from 'zod';
import { checkIfExistsAndAccess } from '~/server/utils/checkIfExistsAndAccess';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

const zDeleteMovieSchema = z.object({
  id: z.number(),
  listId: z.string(),
});

export const deleteMovie = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zDeleteMovieSchema>;
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

  const [updatedList] = await ctx.prisma.$transaction([
    ctx.prisma.list.update({
      where: { id: input.listId },
      data: {
        movies: { disconnect: { id: input.id } },
        updatedAt: new Date(),
      },
    }),
    ctx.prisma.checkedMovie.deleteMany({
      where: {
        AND: [{ movieId: input.id }, { listId: input.listId }],
      },
    }),
  ]);

  return updatedList;
};

export const deleteMovieProcedure = protectedProcedure
  .input(zDeleteMovieSchema)
  .mutation(deleteMovie);
