import { z } from 'zod';

const maxLengthTransform = (string: string | undefined | null) =>
  string && string.length > 1000 ? string.slice(0, 995) + '...' : string;

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

export const zTmdbShow = z.object({
  id: z.number().int(),
  name: z.string(),
  overview: z.string().nullish().transform(maxLengthTransform),
  first_air_date: z.string().date().nullish(),
  genres: z.array(z.object({ name: z.string() })).nullish(),
  poster_path: z.string(),
  vote_average: z.number(),
  seasons: z.array(z.object({ season_number: z.number().int() })),
});

export const zTmdbEpisode = z.object({
  id: z.number().int(),
  episode_number: z.number().int(),
  name: z.string(),
  overview: z.string().nullish().transform(maxLengthTransform),
  air_date: z.string().date().nullish(),
});

export const zTmdbSeason = z.object({
  id: z.number(),
  season_number: z.number().int(),
  name: z.string(),
  overview: z.string().nullish().transform(maxLengthTransform),
  air_date: z.string().date(),
  episodes: z.array(zTmdbEpisode),
});
