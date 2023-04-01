import type { TMDBMovie } from '~/types/TMDBMovie';
import { TMDBCollection } from '~/types/TMDBMovie';
import { env } from '~/env.mjs';
import type { z } from 'zod';
import type { Collection as CollectionType, Movie } from '@prisma/client';
import type { createTRPCContext } from './api/trpc';
import { TRPCError } from '@trpc/server';

export const getTMDBMovie = async (
  id: number | string,
): Promise<{ json: TMDBMovie; etag: string } | null> => {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${id}&language=en-US`,
    {
      headers: {
        Authorization: `Bearer ${env.TMDB_API_KEY ?? ''}`,
      },
    },
  );

  if (!res.ok) {
    return null;
  }

  return {
    json: (await res.json()) as TMDBMovie,
    etag: res.headers.get('etag') ?? '',
  };
};

export const getTMDBCollection = async (
  id: number,
): Promise<{ json: z.infer<typeof TMDBCollection>; etag: string }> => {
  const res = await fetch(
    `https://api.themoviedb.org/3/collection/${id}?language=en-US`,
    {
      headers: {
        Authorization: `Bearer ${env.TMDB_API_KEY ?? ''}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error('TMDB_FETCH_ERROR');
  }

  return {
    json: TMDBCollection.parse(await res.json()),
    etag: res.headers.get('etag') ?? '',
  };
};

export const createDBMovieFromTMDBMovie = (
  movie: TMDBMovie,
  etag: string,
): Omit<Movie, 'updatedAt'> => ({
  id: movie.id,
  title: movie.title,
  posterUrl: movie.poster_path,
  description: movie.overview,
  genres: movie.genres.map((g) => g.name).join(', '),
  runtime: movie.runtime,
  releaseDate: movie.release_date,
  rating: movie.vote_average.toFixed(1),
  etag,
});

export const checkAndUpdateMovie = async (
  ctx: Awaited<ReturnType<typeof createTRPCContext>>,
  movie: Pick<Movie, 'id' | 'updatedAt' | 'etag'>,
) => {
  // if movie data is at least 1 day old, update it
  if (movie.updatedAt < new Date(Date.now() - 1000 * 60 * 60 * 24)) {
    const needsUpdate =
      (
        await fetch(`https://api.themoviedb.org/3/movie/${movie.id}`, {
          headers: {
            Authorization: `Bearer ${env.TMDB_API_KEY}`,
            'If-None-Match': movie.etag ?? '',
          },
        })
      ).status !== 304;

    if (!needsUpdate) return;

    const tmdbMovie = await getTMDBMovie(movie.id);
    if (!tmdbMovie)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Something went wrong finding that movie on TMDB.',
      });

    await ctx.prisma.movie.update({
      where: { id: movie.id },
      data: {
        ...createDBMovieFromTMDBMovie(tmdbMovie.json, tmdbMovie.etag),
        updatedAt: new Date(),
      },
    });
  }
};

export const checkAndUpdateCollection = async (
  ctx: Awaited<ReturnType<typeof createTRPCContext>>,
  collection: Pick<CollectionType, 'id' | 'updatedAt'>,
) => {
  // if collection data is at least 1 day old, update it
  if (collection.updatedAt < new Date(Date.now() - 1000 * 60 * 60 * 24)) {
    let tmdbCollection;
    try {
      tmdbCollection = await getTMDBCollection(collection.id);
    } catch (e) {
      console.log(e);
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Something went wrong finding that collection on TMDB.',
      });
    }

    if (!tmdbCollection)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Something went wrong finding that collection on TMDB.',
      });

    const movies = await Promise.all(
      tmdbCollection.json.parts.map(async (part) => {
        let movie = await ctx.prisma.movie.findUnique({
          where: { id: part.id },
        });

        if (!movie) {
          const tmdbMovie = await getTMDBMovie(part.id);
          if (!tmdbMovie)
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Something went wrong finding that movie on TMDB.',
            });

          movie = await ctx.prisma.movie.create({
            data: {
              ...createDBMovieFromTMDBMovie(tmdbMovie.json, tmdbMovie.etag),
            },
          });
        }

        await checkAndUpdateMovie(ctx, movie);

        return movie;
      }),
    );

    const { id, name, overview, poster_path, backdrop_path } =
      tmdbCollection.json;

    return await ctx.prisma.collection.upsert({
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
