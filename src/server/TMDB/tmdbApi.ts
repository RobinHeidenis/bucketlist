import type { TmdbClient } from '~/server/TMDB/tmdbClient';

export class TmdbApi {
  constructor(private client: TmdbClient) {}

  async getMovieById(id: number) {
    return this.client.get(`movie/${id}`);
  }

  async checkMovieETag(id: number, eTag: string) {
    return this.client.get(`movie/${id}`, {
      headers: {
        'If-None-Match': eTag,
      },
    });
  }
}
