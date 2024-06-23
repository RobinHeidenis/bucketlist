import { TmdbApi } from '~/server/TMDB/tmdbApi';
import type { prisma as Prisma } from '~/server/db';
import type { z } from 'zod';
import { zTmdbMovie } from '~/server/TMDB/schemas';
import { propOrUnknown } from '~/utils/propOrUnknown';
import { convertImageToHash } from '~/utils/convertImageToHash';
import { type Movie } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';
import { TmdbClient } from '~/server/TMDB/tmdbClient';
import { env } from '~/env.mjs';

export const createTmdbService = (prisma: typeof Prisma) => {
  const tmdbClient = new TmdbClient(env.TMDB_API_KEY);
  const tmdbApi = new TmdbApi(tmdbClient);
  return new TmdbService(tmdbApi, prisma);
};

export class TmdbService {
  constructor(
    private tmdbApi: TmdbApi,
    private prisma: typeof Prisma,
  ) {}

  public async findOrCreateMovie(id: number) {
    const movie = await this.prisma.movie.findUnique({
      where: { id },
    });

    if (!movie) {
      const { result, response } = await this.tmdbApi.getMovieById(id);

      const parsedMovieResult = zTmdbMovie.safeParse(result);

      if (!parsedMovieResult.success) {
        Sentry.setContext('TMDB movie response', {
          id,
          result,
        });
        throw new Error('Failed to parse TMDB movie response');
      }

      return this.prisma.movie.create({
        data: {
          ...(await this.transformTmdbMovie(parsedMovieResult.data)),
          etag: response.headers.get('etag') ?? '',
        },
      });
    }

    return movie;
  }

  public async getUpdatedMovie(id: number, eTag: string) {
    const { response, result } = await this.tmdbApi.checkMovieETag(id, eTag);

    if (response.status === 304) {
      return false;
    }

    if (result) {
      const parsedMovieResult = zTmdbMovie.safeParse(result);

      if (!parsedMovieResult.success) {
        Sentry.setContext('TMDB movie response', {
          id,
          result,
        });
        throw new Error('Failed to parse TMDB movie response');
      }

      return this.prisma.movie.create({
        data: {
          ...(await this.transformTmdbMovie(parsedMovieResult.data)),
          etag: response.headers.get('etag') ?? '',
        },
      });
    }

    return result;
  }

  private async transformTmdbMovie(
    movie: z.infer<typeof zTmdbMovie>,
  ): Promise<Omit<Movie, 'updatedAt' | 'etag'>> {
    return {
      id: movie.id,
      title: movie.title,
      description: movie.overview ?? null,
      posterUrl: movie.poster_path,
      genres: movie.genres ? movie.genres.map((g) => g.name).join(', ') : null,
      runtime: movie.runtime ?? null,
      releaseDate: propOrUnknown(movie.release_date),
      rating: propOrUnknown(movie.vote_average?.toFixed(1)),
      imageHash: await convertImageToHash(movie.poster_path),
    };
  }
}
