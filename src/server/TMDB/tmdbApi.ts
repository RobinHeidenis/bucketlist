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

  public async checkCollectionETag(id: number, eTag: string) {
    return this.client.get(`collection/${id}`, {
      headers: {
        'If-None-Match': eTag,
      },
    });
  }

  public async getShowById(id: number) {
    return this.client.get(`tv/${id}`);
  }

  public async checkShowETag(id: number, eTag: string) {
    return this.client.get(`tv/${id}`, {
      headers: {
        'If-None-Match': eTag,
      },
    });
  }

  public async getSeasonBySeasonNumber(showId: number, seasonNumber: number) {
    return this.client.get(`tv/${showId}/season/${seasonNumber}`);
  }

  public async checkSeasonETag(
    showId: number,
    seasonNumber: number,
    eTag: string,
  ) {
    return this.client.get(`tv/${showId}/season/${seasonNumber}`, {
      headers: {
        'If-None-Match': eTag,
      },
    });
  }
}
