import { z } from 'zod';
import { basicRequest } from '~/server/TMDB/basicRequest';
import { showSchema } from '~/server/TMDB/getShow';

export const Crew = z.object({
  department: z.string().optional(),
  job: z.string().optional(),
  credit_id: z.string().optional(),
  adult: z.boolean().nullable().optional(),
  gender: z.number().nullable().optional(),
  id: z.number().optional(),
  known_for_department: z.string().optional(),
  name: z.string().optional(),
  original_name: z.string().optional(),
  popularity: z.number().optional(),
  profile_path: z.string().nullable().optional(),
});

export const GuestStar = z.object({
  credit_id: z.string().optional(),
  order: z.number().optional(),
  character: z.string().optional(),
  adult: z.boolean().optional(),
  gender: z.number().nullable().optional(),
  id: z.number().optional(),
  known_for_department: z.string().optional(),
  name: z.string().optional(),
  original_name: z.string().optional(),
  popularity: z.number().optional(),
  profile_path: z.string().nullable().optional(),
});

export const Episode = z.object({
  air_date: z.string().nullable().optional(),
  episode_number: z.number(),
  crew: z.array(Crew).optional(),
  guest_stars: z.array(GuestStar).optional(),
  id: z.number(),
  name: z.string(),
  overview: z.string().optional(),
  production_code: z.string().optional(),
  season_number: z.number().optional(),
  still_path: z.string().nullable().optional(),
  vote_average: z.number().optional(),
  vote_count: z.number().optional(),
});

export const seasonSchema = z.object({
  _id: z.string().optional(),
  air_date: z.string().nullable().optional(),
  episodes: z.array(Episode).optional(),
  name: z.string(),
  overview: z.string().optional(),
  id: z.number(),
  poster_path: z.string().nullable().optional(),
  season_number: z.number().nullable().optional(),
});

export const getSeason = async (
  showId: number | string,
  seasonNumber: number | string,
  options?: RequestInit,
) => {
  const { result, response } = await basicRequest(
    `tv/${showId}/season/${seasonNumber}`,
    options,
  );

  return {
    result: seasonSchema.parse(result),
    eTag: response.headers.get('etag') ?? '',
  };
};

export const getSeasons = async (
  showId: number | string,
  maxSeasonNumber: number,
  options?: RequestInit,
) => {
  let appendToResponse = '';
  let remainingSeasons = maxSeasonNumber;
  let seasonsAdded = 0;
  const resultArray = [];

  while (remainingSeasons > 0) {
    const seasonsToAdd = Math.min(19, remainingSeasons);

    for (let i = seasonsAdded; i <= seasonsAdded + seasonsToAdd; i++) {
      appendToResponse += `season/${i},`;
    }
    const { result } = await basicRequest(
      `tv/${showId}?append_to_response=${appendToResponse}`,
      options,
    );

    const show = showSchema
      .catchall(seasonSchema.augment({ id: z.number().optional() }))
      .parse(result);

    const mergedSeasons =
      show.seasons
        ?.slice(seasonsAdded, seasonsAdded + seasonsToAdd + 1)
        .map((s, i) => {
          if (
            !Object.hasOwn(s, 'season_number') ||
            typeof s.season_number !== 'number'
          )
            throw new Error(`Season ${i + 1} has no season_number`);
          const season = show[`season/${s.season_number}`];
          if (!season) throw new Error(`Season ${s.season_number} not found`);

          delete show[`seasons/${s.season_number}`];

          return {
            ...season,
            id: s.id,
          };
        }) ?? [];

    resultArray.push(...mergedSeasons);

    remainingSeasons -= seasonsToAdd;
    seasonsAdded += seasonsToAdd + 1;
    appendToResponse = '';
  }

  return {
    result: resultArray,
  };
};
