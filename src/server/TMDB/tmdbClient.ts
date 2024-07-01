import * as Sentry from '@sentry/nextjs';
import { TRPCError } from '@trpc/server';

export class TmdbClient {
  private readonly baseUrl = 'https://api.themoviedb.org/3/';

  constructor(private apiKey: string) {}

  async request(endpoint: string, options: RequestInit = {}) {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    if (!res.ok) {
      Sentry.setContext('TMDB Request', {
        endpoint,
        body: options.body,
        status: res.status,
        response: await res.text(),
      });

      if (res.status === 404) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Failed to find item on TMDB',
        });
      }

      throw new Error('Failed to fetch from TMDB');
    }

    return { result: (await res.json()) as unknown, response: res };
  }

  public async get(endpoint: string, options?: RequestInit) {
    return this.request(endpoint, options);
  }
}
