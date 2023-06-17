import * as z from 'zod';
import {basicRequest} from '~/server/TMDB/basicRequest';
import {seasonSchema} from '~/server/TMDB/getSeason';

export const showSchema = z.object({
    id: z.number(),
    name: z.string(),
    overview: z.string().optional(),
    backdrop_path: z.string().nullable().optional(),
    created_by: z
        .array(
            z.object({
                id: z.number().optional(),
                credit_id: z.string().optional(),
                name: z.string().optional(),
                gender: z.number().optional(),
                profile_path: z.string().nullable().optional(),
            }),
        )
        .optional(),
    episode_run_time: z.array(z.number()).optional(),
    first_air_date: z.string().optional(),
    genres: z
        .array(
            z.object({
                id: z.number().optional(),
                name: z.string().optional(),
            }),
        )
        .optional(),
    homepage: z.string().optional(),
    in_production: z.boolean().optional(),
    languages: z.array(z.string()).optional(),
    last_air_date: z.string().nullable().optional(),
    last_episode_to_air: z
        .object({
            air_date: z.string().optional(),
            episode_number: z.number().optional(),
            id: z.number().optional(),
            name: z.string().optional(),
            overview: z.string().optional(),
            production_code: z.string().optional(),
            season_number: z.number().optional(),
            still_path: z.string().nullable().optional(),
            vote_average: z.number().optional(),
            vote_count: z.number().optional(),
        })
        .nullable()
        .optional(),
    next_episode_to_air: z.object({}).nullable().optional(), // TODO: find proper shape for this, or maybe just focus on only validating the properties we care about?
    networks: z
        .array(
            z.object({
                name: z.string().optional(),
                id: z.number().optional(),
                logo_path: z.string().nullable().optional(),
                origin_country: z.string().optional(),
            }),
        )
        .optional(),
    number_of_episodes: z.number().optional(),
    number_of_seasons: z.number().optional(),
    origin_country: z.array(z.string()).optional(),
    original_language: z.string().optional(),
    original_name: z.string().optional(),
    popularity: z.number().optional(),
    poster_path: z.string().nullable().optional(),
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
    seasons: z.array(seasonSchema).optional(),
    spoken_languages: z
        .array(
            z.object({
                english_name: z.string().optional(),
                iso_639_1: z.string().optional(),
                name: z.string().optional(),
            }),
        )
        .optional(),
    status: z.string().optional(),
    tagline: z.string().optional(),
    type: z.string().optional(),
    adult: z.boolean().optional(),
    vote_average: z.number().optional(),
    vote_count: z.number().optional(),
});

export const getShow = async (id: number | string, options?: RequestInit) => {
    const {result, response} = await basicRequest(`tv/${id}`, options);

    return {
        result: showSchema.parse(result),
        eTag: response.headers.get('etag') ?? '',
    };
};
