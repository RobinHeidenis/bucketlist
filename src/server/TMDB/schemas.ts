import { z } from 'zod';

export const zTmdbMovie = z.object({
  id: z.number().int(),
  title: z.string(),
  overview: z.string().nullish(),
  poster_path: z.string().nullable(),
  genres: z.array(z.object({ name: z.string().optional() })).nullish(),
  runtime: z.number().nullish(),
  release_date: z.string().date().nullish(),
  vote_average: z.number().optional(),
});

export const zTmdbCollection = z.object({
  id: z.number().int(),
  name: z.string(),
  overview: z.string().nullish(),
  poster_path: z.string().nullish(),
  parts: z.array(z.object({ id: z.number().int() })),
});
