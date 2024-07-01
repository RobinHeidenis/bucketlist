import type { z } from 'zod';
import { zNewMovieSchema } from '~/schemas/listSchemas';
import { checkIfExistsAndAccess } from '~/server/utils/checkIfExistsAndAccess';
import { TRPCError } from '@trpc/server';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';
import { createTmdbService } from '~/server/TMDB/tmdbService';

export const createMovie = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zNewMovieSchema>;
}) => {
  const list = await ctx.prisma.list.findUnique({
    where: { id: input.listId },
    select: {
      _count: { select: { movies: { where: { id: input.externalId } } } },
      ownerId: true,
      collaborators: { select: { id: true } },
      type: true,
    },
  });

  checkIfExistsAndAccess(ctx, list, 'MOVIE');

  if (list._count.movies) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'That movie is already in this list.',
    });
  }

  const tmdbService = createTmdbService(ctx.prisma);
  const movie = await tmdbService.findOrCreateMovie(input.externalId);

  return ctx.prisma.list.update({
    where: { id: input.listId },
    data: {
      movies: { connect: { id: movie.id } },
      updatedAt: new Date(),
    },
  });
};

export const createMovieProcedure = protectedProcedure
  .input(zNewMovieSchema)
  .mutation(createMovie);
