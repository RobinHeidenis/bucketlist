import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { env } from '../../../env/server.mjs';
import { TMDBSearchResult } from '../../../types/TMDBMovie';

export const movieRouter = createTRPCRouter({
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?query=${input.query}&language=en-US`,
        {
          headers: {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            Authorization: `Bearer ${env.TMDB_API_KEY ?? ''}`,
          },
        },
      );

      if (!res.ok) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong searching TMDB.',
        });
      }

      try {
        const parsed = TMDBSearchResult.parse(await res.json());
        return parsed.results;
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong searching TMDB.',
        });
      }
    }),
});
