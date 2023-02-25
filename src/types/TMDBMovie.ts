import { z } from 'zod';

export type TMDBMovie = {
  adult: boolean;
  backdrop_path: string | null;
  belongs_to_collection: object | null;
  budget: number;
  genres: {
    id: number;
    name: string;
  }[];
  homepage: string | null;
  id: number;
  imdb_id: string | null;
  original_language: string;
  original_title: string;
  overview: string | null;
  popularity: number;
  poster_path: string | null;
  production_companies: {
    name: string;
    id: number;
    logo_path: string | null;
    origin_country: string;
  }[];
  production_countries: {
    iso_3166_1: string;
    name: string;
  }[];
  release_date: string;
  revenue: number;
  runtime: number | null;
  spoken_languages: {
    iso_639_1: string;
    name: string;
  }[];
  status:
    | 'Rumored'
    | 'Planned'
    | 'In Production'
    | 'Post Production'
    | 'Released'
    | 'Canceled';
  tagline: string | null;
  title: string;
  video: boolean;
  vote_average: number;
  vote_count: number;
};

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

export const TMDBSearchResult = z.object({
  page: z.number(),
  results: z.array(TMDBSearchMovie),
  total_pages: z.number(),
  total_results: z.number(),
});
