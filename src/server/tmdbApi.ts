import type { Collection as CollectionType, Movie } from '@prisma/client';
import type { createTRPCContext } from './api/trpc';
import { TRPCError } from '@trpc/server';
import {
  getMovie,
  hasMovieBeenUpdated,
  transformAPIMovie,
} from '~/server/TMDB/getMovie';
import { hasCollectionBeenUpdated } from '~/server/TMDB/getCollection';

export const checkAndUpdateMovie = async (
  ctx: Awaited<ReturnType<typeof createTRPCContext>>,
  movie: Pick<Movie, 'id' | 'updatedAt' | 'etag'>,
) => {
  // if movie data is at least 1 day old, update it
  if (movie.updatedAt < new Date(Date.now() - 1000 * 60 * 60 * 24)) {
    if (!(await hasMovieBeenUpdated(movie.id, movie.etag))) return;

    const tmdbMovie = await getMovie(movie.id);

    // I am pretty sure there are cases where this can happen, as I've seen this error before. However, I am not going to try to find out now, so consider this a TODO for later.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    if (!tmdbMovie)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Something went wrong finding that movie on TMDB.',
      });

    await ctx.prisma.movie.update({
      where: { id: movie.id },
      data: {
        ...transformAPIMovie(tmdbMovie.result, tmdbMovie.eTag),
        updatedAt: new Date(),
      },
    });
  }
};

export const checkAndUpdateCollection = async (
  ctx: Awaited<ReturnType<typeof createTRPCContext>>,
  collection: Pick<CollectionType, 'id' | 'updatedAt' | 'etag'>,
) => {
  // if collection data is at least 1 day old, update it
  if (collection.updatedAt < new Date(Date.now() - 1000 * 60 * 60 * 24)) {
    let tmdbCollection;
    try {
      tmdbCollection = await hasCollectionBeenUpdated(
        collection.id,
        collection.etag,
      );
      if (!tmdbCollection) return;
    } catch (e) {
      console.log(e);
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Something went wrong finding that collection on TMDB.',
      });
    }

    const movies = await Promise.all(
      tmdbCollection.result.parts.map(async (part) => {
        let movie = await ctx.prisma.movie.findUnique({
          where: { id: part.id },
          select: { id: true, updatedAt: true, etag: true },
        });

        if (!movie) {
          const { result, eTag } = await getMovie(part.id);

          movie = await ctx.prisma.movie.create({
            data: transformAPIMovie(result, eTag),
          });
        } else {
          await checkAndUpdateMovie(ctx, movie);
        }

        return movie;
      }),
    );

    const { id, name, overview, poster_path, backdrop_path } =
      tmdbCollection.result;

    return ctx.prisma.collection.upsert({
      where: { id },
      create: {
        id,
        name,
        overview,
        posterUrl: poster_path ?? backdrop_path,
        movies: { connect: movies.map((movie) => ({ id: movie.id })) },
        etag: tmdbCollection.etag,
      },
      update: {
        id,
        name,
        overview,
        posterUrl: poster_path ?? backdrop_path,
        updatedAt: new Date(),
        movies: { connect: movies.map((movie) => ({ id: movie.id })) },
        etag: tmdbCollection.etag,
      },
    });
  }
};
