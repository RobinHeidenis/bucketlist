import { TmdbApi } from '~/server/TMDB/tmdbApi';
import type { prisma as Prisma } from '~/server/db';
import type { z } from 'zod';
import {
  zTmdbCollection,
  zTmdbMovie,
  zTmdbSeason,
  zTmdbShow,
} from '~/server/TMDB/schemas';
import { propOrUnknown } from '~/utils/propOrUnknown';
import { convertImageToHash } from '~/utils/convertImageToHash';
import type { Collection, Episode, Season, Show } from '@prisma/client';
import { type Movie } from '@prisma/client';
import * as Sentry from '@sentry/nextjs';
import { TmdbClient } from '~/server/TMDB/tmdbClient';
import { env } from '~/env.mjs';
import { TRPCError } from '@trpc/server';

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

  public async getUpdatedShow(id: number, eTag: string) {
    const { response, result } = await this.tmdbApi.checkShowETag(id, eTag);

    if (response.status === 304) {
      return false;
    }

    if (result) {
      return this.parseAndCreateShow(result, response, id);
    }

    return result;
  }

  public async getUpdatedSeason(
    showId: number,
    seasonNumber: number,
    eTag: string,
  ) {
    const { response, result } = await this.tmdbApi.checkSeasonETag(
      showId,
      seasonNumber,
      eTag,
    );

    if (response.status === 304) {
      return false;
    }

    if (result) {
      return this.parseAndCreateSeason(result, response, showId, seasonNumber);
    }

    return result;
  }

  public async findOrCreateCollection(id: number) {
    const collection = await this.prisma.collection.findUnique({
      where: { id },
    });

    if (!collection) {
      const { result, response } = await this.tmdbApi.getCollectionById(id);

      return this.parseAndCreateCollection(result, response, id);
    }

    return collection;
  }

  public async getUpdatedCollection(id: number, eTag: string) {
    const { response, result } = await this.tmdbApi.checkCollectionETag(
      id,
      eTag,
    );

    if (response.status === 304) {
      return false;
    }

    if (result) {
      return this.parseAndCreateCollection(result, response, id);
    }

    return result;
  }

  public async findOrCreateShow(id: number) {
    const collection = await this.prisma.show.findUnique({
      where: { id },
    });

    if (!collection) {
      const { result, response } = await this.tmdbApi.getShowById(id);

      return this.parseAndCreateShow(result, response, id);
    }

    return collection;
  }

  public async findOrCreateSeason(
    showOrSeasonId: number,
    seasonNumber?: number,
  ) {
    let where: Parameters<
      (typeof this.prisma)['season']['findUnique']
    >[0]['where'] = { id: showOrSeasonId };
    if (seasonNumber) {
      where = {
        showId_seasonNumber: {
          showId: showOrSeasonId,
          seasonNumber: seasonNumber,
        },
      };
    }

    const season = await this.prisma.season.findUnique({
      where,
    });

    if (!season) {
      if (!seasonNumber)
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'Cannot get a season from TMDB without a seasonNumber',
        });

      const { result, response } = await this.tmdbApi.getSeasonBySeasonNumber(
        showOrSeasonId,
        seasonNumber,
      );

      return this.parseAndCreateSeason(
        result,
        response,
        showOrSeasonId,
        seasonNumber,
      );
    }

    return season;
  }

  private async parseAndCreateSeason(
    result: unknown,
    response: Response,
    showId: number,
    seasonNumber: number,
  ) {
    const parsedSeasonResult = zTmdbSeason.safeParse(result);

    if (!parsedSeasonResult.success) {
      Sentry.setContext('TMDB Response', {
        showId,
        seasonNumber,
        type: 'SEASON',
        response: result,
      });
      throw new Error('Failed to parse TMDB season response');
    }

    const { season, episodes } = this.transformTmdbSeason(
      parsedSeasonResult.data,
      showId,
    );

    const upsertData = {
      ...season,
      etag: response.headers.get('etag') ?? '',
    };

    return this.prisma.season.upsert({
      where: { showId_seasonNumber: { showId, seasonNumber } },
      create: {
        ...upsertData,
        episodes: {
          createMany: {
            data: episodes,
          },
        },
      },
      update: {
        ...upsertData,
        episodes: {
          upsert: episodes.map((episode) => ({
            where: { id: episode.id },
            create: episode,
            update: episode,
          })),
        },
      },
    });
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

    const upsertData = {
      ...(await this.transformTmdbCollection(parsedCollectionResult.data)),
      etag: response.headers.get('etag') ?? '',
    };

    const createdCollection = await this.prisma.collection.upsert({
      where: { id: upsertData.id },
      create: upsertData,
      update: upsertData,
    });

    return {
      collection: createdCollection,
      parts: parsedCollectionResult.data.parts,
    };
  }

  private async parseAndCreateShow(
    result: unknown,
    response: Response,
    id: number,
  ) {
    const parsedShowResult = zTmdbShow.safeParse(result);

    if (!parsedShowResult.success) {
      Sentry.setContext('TMDB Response', {
        id,
        type: 'SHOW',
        response: result,
      });
      throw new Error('Failed to parse TMDB show response');
    }

    const upsertData = {
      ...(await this.transformTmdbShow(parsedShowResult.data)),
      etag: response.headers.get('etag') ?? '',
    };

    const show = await this.prisma.show.upsert({
      where: { id: parsedShowResult.data.id },
      create: upsertData,
      update: upsertData,
    });

    const seasons = await Promise.all(
      parsedShowResult.data.seasons.map((season) =>
        this.findOrCreateSeason(id, season.season_number),
      ),
    );

    return this.prisma.show.update({
      where: { id: show.id },
      data: {
        seasons: {
          connect: seasons.map(({ id }) => ({ id })),
        },
      },
    });
  }

  private async transformTmdbShow(
    show: z.infer<typeof zTmdbShow>,
  ): Promise<Omit<Show, 'updatedAt' | 'etag'>> {
    return {
      id: show.id,
      title: show.name,
      description: show.overview ?? null,
      posterUrl: show.poster_path,
      rating: show.vote_average.toString(),
      releaseDate: show.first_air_date ?? null,
      genres: show.genres?.map((genre) => genre.name).join(', ') ?? 'Unknown',
      imageHash: await convertImageToHash(show.poster_path),
    };
  }

  private transformTmdbSeason(
    season: z.infer<typeof zTmdbSeason>,
    showId: number,
  ): {
    season: Omit<Season, 'updatedAt' | 'etag'>;
    episodes: Omit<Episode, 'updatedAt' | 'seasonId'>[];
  } {
    return {
      season: {
        id: season.id,
        seasonNumber: season.season_number,
        showId,
        title: season.name,
        overview: season.overview ?? null,
        releaseDate: season.air_date,
      },
      episodes: season.episodes.map((episode) => ({
        id: episode.id,
        title: episode.name,
        overview: episode.overview ?? null,
        episodeNumber: episode.episode_number,
        releaseDate: episode.air_date ?? 'Unknown',
      })),
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

    const upsertData = {
      ...(await this.transformTmdbMovie(parsedMovieResult.data)),
      etag: response.headers.get('etag') ?? '',
    };

    return this.prisma.movie.upsert({
      where: { id: parsedMovieResult.data.id },
      create: upsertData,
      update: upsertData,
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
