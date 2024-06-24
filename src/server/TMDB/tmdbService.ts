import { TmdbApi } from '~/server/TMDB/tmdbApi';
import type { prisma as Prisma } from '~/server/db';
import type { z } from 'zod';
import { zTmdbCollection, zTmdbMovie } from '~/server/TMDB/schemas';
import { propOrUnknown } from '~/utils/propOrUnknown';
import { convertImageToHash } from '~/utils/convertImageToHash';
import type { Collection } from '@prisma/client';
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

      return this.parseAndCreateMovie(result, response, id);
    }

    return movie;
  }

  public async getUpdatedMovie(id: number, eTag: string) {
    const { response, result } = await this.tmdbApi.checkMovieETag(id, eTag);

    if (response.status === 304) {
      return false;
    }

    if (result) {
      return this.parseAndCreateMovie(result, response, id);
    }

    return result;
  }

  public async findOrCreateCollection(id: number) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      const { result, response } = await this.tmdbApi.getCollectionById(id);

      return await this.parseAndCreateCollection(result, response, id);
    }

    return collection;
  }

  private async parseAndCreateCollection(
    result: unknown,
    response: Response,
    id: number,
  ) {
    const parsedCollectionResult = zTmdbCollection.safeParse(result);

    if (!parsedCollectionResult.success) {
      Sentry.setContext('TMDB Response', {
        id,
        type: 'COLLECTION',
        response: result,
      });
      throw new Error('Failed to parse TMDB collection response');
    }

    const createdCollection = await this.prisma.collection.create({
      data: {
        ...(await this.transformTmdbCollection(parsedCollectionResult.data)),
        etag: response.headers.get('etag') ?? '',
      },
    });

    return {
      collection: createdCollection,
      parts: parsedCollectionResult.data.parts,
    };
  }

  private async parseAndCreateMovie(
    result: unknown,
    response: Response,
    id: number,
  ) {
    const parsedMovieResult = zTmdbMovie.safeParse(result);

    if (!parsedMovieResult.success) {
      Sentry.setContext('TMDB Response', {
        id,
        type: 'MOVIE',
        response: result,
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

  private async transformTmdbCollection(
    collection: z.infer<typeof zTmdbCollection>,
  ): Promise<Omit<Collection, 'updatedAt' | 'etag'>> {
    return {
      id: collection.id,
      name: collection.name,
      overview: collection.overview ?? null,
      posterUrl: collection.poster_path ?? null,
      imageHash: await convertImageToHash(collection.poster_path),
    };
  }
}
