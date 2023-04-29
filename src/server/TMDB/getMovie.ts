import { basicRequest } from '~/server/TMDB/basicRequest';
import { z } from 'zod';
import { type Movie } from '@prisma/client';

export const movieSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  poster_path: z.string().nullable(),
  adult: z.boolean().optional(),
  backdrop_path: z.string().nullable().optional(),
  belongs_to_collection: z
    .object({
      id: z.number().optional(),
      name: z.string().optional(),
      poster_path: z.string().nullable().optional(),
      backdrop_path: z.string().nullable().optional(),
    })
    .nullable()
    .optional(),
  budget: z.number().int().optional(),
  genres: z
    .array(
      z.object({
        id: z.number().optional(),
        name: z.string().optional(),
      }),
    )
    .optional(),
  imdb_id: z.string().min(9).max(10).optional().nullable(),
  original_language: z.string().optional(),
  original_title: z.string().optional(),
  overview: z.string().nullable().optional(),
  popularity: z.number().optional(),
  production_companies: z
    .array(
      z.object({
        id: z.number().optional(),
        logo_path: z.string().nullable().optional(),
        name: z.string().optional(),
        origin_country: z.string().optional(),
      }),
    )
    .optional(),
  production_countries: z
    .array(
      z.object({
        iso_3166_1: z.string().optional(),
        name: z.string().optional(),
      }),
    )
    .optional(),
  release_date: z
    .string()
    .regex(/^(\d{4})-(\d{2})-(\d{2})$/)
    .nullable()
    .optional(),
  revenue: z.number().int().optional(),
  runtime: z.number().nullable().optional(),
  spoken_languages: z
    .array(
      z.object({
        iso_639_1: z.string().optional(),
        name: z.string().optional(),
      }),
    )
    .optional(),
  status: z
    .enum([
      'Rumored',
      'Planned',
      'In Production',
      'Post Production',
      'Released',
      'Canceled',
    ])
    .optional(),
  tagline: z.string().nullable().optional(),
  video: z.boolean().optional(),
  vote_average: z.number().optional(),
  vote_count: z.number().int().optional(),
});

export const transformAPIMovie = (
  movie: z.infer<typeof movieSchema>,
  etag: string,
): Omit<Movie, 'updatedAt'> => ({
  id: movie.id,
  title: movie.title,
  description: movie.overview ?? null,
  posterUrl: movie.poster_path,
  genres: movie.genres ? movie.genres.map((g) => g.name).join(', ') : null,
  runtime: movie.runtime ?? null,
  releaseDate: movie.release_date ?? 'Unknown',
  rating: movie.vote_average?.toFixed(1) ?? 'Unknown',
  etag,
});
export const getMovie = async (id: number | string, options?: RequestInit) => {
  const { result, response } = await basicRequest(`movie/${id}`, options);

  return {
    result: movieSchema.parse(result),
    eTag: response.headers.get('etag') ?? '',
  };
};

export const hasMovieBeenUpdated = async (
  id: string | number,
  eTag: string | null,
) => {
  if (!eTag) return true;

  const { response } = await basicRequest(`movie/${id}`, {
    headers: {
      'If-None-Match': eTag,
    },
  });

  return response.status !== 304;
};
