import type { z } from 'zod';
import { checkIfExistsAndAccess } from '~/server/utils/checkIfExistsAndAccess';
import { TRPCError } from '@trpc/server';
import { toggleListItemCheckedSchema } from '~/schemas/toggleListItemCheckedSchema';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

export const setCollectionChecked = async ({
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
      collections: { where: { id: input.id }, include: { movies: true } },
    },
  });

  checkIfExistsAndAccess(ctx, list, 'MOVIE');

  return await ctx.prisma.$transaction(async (prisma) => {
    await prisma.list.update({
      where: { id: input.listId },
      data: { updatedAt: new Date() },
    });

    if (!list.collections[0]?.movies.length)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'That collection does not exist.',
      });

    if (input.checked) {
      const alreadyCheckedMovies = (
        await prisma.checkedMovie.findMany({
          where: {
            listId: input.listId,
            movieId: {
              in: list.collections[0].movies.map((movie) => movie.id),
            },
          },
        })
      ).map((m) => m.movieId);

      return ctx.prisma.checkedMovie.createMany({
        data: list.collections[0].movies
          .filter(
            (movie) => !alreadyCheckedMovies.find((id) => id === movie.id),
          )
          .map((movie) => ({
            listId: input.listId,
            movieId: movie.id,
          })),
      });
    } else {
      return ctx.prisma.checkedMovie.deleteMany({
        where: {
          listId: input.listId,
          movieId: {
            in: list.collections[0].movies.map((movie) => movie.id),
          },
        },
      });
    }
  });
};

export const setCollectionCheckedProcedure = protectedProcedure
  .input(toggleListItemCheckedSchema)
  .mutation(setCollectionChecked);
