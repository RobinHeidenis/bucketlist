import { TMDB_FETCH_ERROR } from '~/server/TMDB/TMDB_FETCH_ERROR';
import { env } from '~/env.mjs';

export const BASE_URL = 'https://api.themoviedb.org/3/';

/**
 * Basic request to TMDB API
 * @param endpoint - endpoint to fetch. Base URL is added automatically and ends with a /
 * @param options - options to pass to fetch
 */
export const basicRequest = async (
  endpoint: string,
  options: RequestInit = {},
) => {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${env.TMDB_API_KEY}`,
    },
  });

  if (!res.ok) {
    throw TMDB_FETCH_ERROR;
  }

  return { result: (await res.json()) as unknown, response: res };
};
