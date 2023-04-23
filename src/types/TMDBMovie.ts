import { z } from 'zod';

export const TMDBSearchMovie = z.object({
  id: z.number(),
  adult: z.boolean(),
  poster_path: z.string().optional().nullable(),
  overview: z.string(),
  release_date: z.string(),
  genre_ids: z.array(z.number()),
  original_title: z.string(),
  original_language: z.string(),
  title: z.string(),
  backdrop_path: z.string().optional().nullable(),
  popularity: z.number(),
  vote_count: z.number(),
  video: z.boolean(),
  vote_average: z.number(),
});

export const GenericTMDBSearchResult = z.object({
  page: z.number(),
  total_pages: z.number(),
  total_results: z.number(),
});

export const TMDBSearchCollection = z.object({
  id: z.number(),
  name: z.string(),
  poster_path: z.string().optional().nullable(),
  backdrop_path: z.string().optional().nullable(),
});

export const TMDBSearchTVShow = z.object({
  poster_path: z.string().nullable(),
  popularity: z.number().optional(),
  id: z.number(),
  backdrop_path: z.string().nullable(),
  vote_average: z.number(),
  overview: z.string().optional(),
  first_air_date: z.string().optional(),
  origin_country: z.array(z.string()).optional(),
  genre_ids: z.array(z.number()).optional(),
  original_language: z.string().optional(),
  vote_count: z.number().optional(),
  name: z.string(),
  original_name: z.string().optional(),
});

export const TMDBMovieSearchResult = GenericTMDBSearchResult.extend({
  results: z.array(TMDBSearchMovie),
});

export const TMDBCollectionSearchResult = GenericTMDBSearchResult.extend({
  results: z.array(TMDBSearchCollection),
});

export const TMDBTVShowSearchResult = GenericTMDBSearchResult.extend({
  results: z.array(TMDBSearchTVShow),
});
