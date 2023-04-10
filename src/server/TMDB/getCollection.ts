import { z } from 'zod';
import { basicRequest } from '~/server/TMDB/basicRequest';

const moviePartSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  overview: z.string().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().nullable().optional(),
  adult: z.boolean().optional(),
  genre_ids: z.array(z.number().int()).optional(),
  original_language: z.string().optional(),
  original_title: z.string().optional(),
  release_date: z.string().optional(),
  popularity: z.number().optional(),
  video: z.boolean().optional(),
  vote_average: z.number().optional(),
  vote_count: z.number().int().optional(),
});

const collectionSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  overview: z.string().optional(),
  poster_path: z.string().nullable().optional(),
  backdrop_path: z.string().optional(),
  parts: z.array(moviePartSchema),
});

export const getCollection = async (id: number) => {
  const { result, response } = await basicRequest(`collection/${id}`);

  return {
    result: collectionSchema.parse(result),
    etag: response.headers.get('etag'),
  };
};

export const hasCollectionBeenUpdated = async (
  id: string | number,
  eTag: string | null,
) => {
  const { response, result } = await basicRequest(`collection/${id}`, {
    headers: {
      'If-None-Match': eTag ?? '',
    },
  });

  if (response.status === 304) {
    return null;
  }

  return {
    result: collectionSchema.parse(result),
    etag: response.headers.get('etag'),
  };
};
