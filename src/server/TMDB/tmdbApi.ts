import type { TmdbClient } from '~/server/TMDB/tmdbClient';

export class TmdbApi {
  constructor(private client: TmdbClient) {}

  public async getMovieById(id: number) {
    return this.client.get(`movie/${id}`);
  }

  public async checkMovieETag(id: number, eTag: string) {
    return this.client.get(`movie/${id}`, {
      headers: {
        'If-None-Match': eTag,
      },
    });
  }

  public async getCollectionById(id: number) {
    return this.client.get(`collection/${id}`);
  }
}
