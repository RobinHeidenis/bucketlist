import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { z } from 'zod';
import { basicRequest } from '~/server/TMDB/basicRequest';
import { TRPCError } from '@trpc/server';
import { TMDBTVShowSearchResult } from '~/types/TMDBMovie';

export const showRouter = createTRPCRouter({
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      const showsJSON = await basicRequest(
        `search/tv?query=${input.query}&language=en-US`,
      );

      try {
        return TMDBTVShowSearchResult.parse(showsJSON.result).results;
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong searching TMDB.',
        });
      }
    }),
});
