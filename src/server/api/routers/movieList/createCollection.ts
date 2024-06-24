import { zNewMovieSchema } from '~/schemas/listSchemas';
import type { z } from 'zod';
import { checkIfExistsAndAccess } from '~/server/utils/checkIfExistsAndAccess';
import { TRPCError } from '@trpc/server';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';
import { createTmdbService } from '~/server/TMDB/tmdbService';
import * as Sentry from '@sentry/nextjs';

export const createCollection = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zNewMovieSchema>;
}) => {
  const list = await ctx.prisma.list.findUnique({
    where: { id: input.listId },
    select: {
      _count: {
        select: { collections: { where: { id: input.externalId } } },
      },
      ownerId: true,
      collaborators: { select: { id: true } },
      type: true,
    },
  });

  checkIfExistsAndAccess(ctx, list, 'MOVIE');

  if (list._count.collections) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'That collection is already in this list.',
    });
  }

  const tmdbService = createTmdbService(ctx.prisma);

  const collection = await tmdbService.findOrCreateCollection(input.externalId);

  if ('parts' in collection) {
    try {
      const movies = await Promise.all(
        collection.parts.map((part) => {
          return tmdbService.findOrCreateMovie(part.id);
        }),
      );
      await ctx.prisma.collection.update({
        where: { id: collection.collection.id },
        data: {
          movies: {
            connect: movies.map((movie) => ({ id: movie.id })),
          },
        },
      });
    } catch (e) {
      Sentry.setContext('Collection movies inserts', {
        ids: collection.parts.map((part) => part.id),
        error: e instanceof Error ? e.message : e,
      });
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message:
          'Something went wrong inserting a movie from a collection into the database',
      });
    }
  }

  return ctx.prisma.list.update({
    where: { id: input.listId },
    data: {
      collections: {
        connect: {
          id: 'parts' in collection ? collection.collection.id : collection.id,
        },
      },
      updatedAt: new Date(),
    },
  });
};

export const createCollectionProcedure = protectedProcedure
  .input(zNewMovieSchema)
  .mutation(createCollection);
