import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import {
  TMDBCollectionSearchResult,
  TMDBMovieSearchResult,
} from '~/types/TMDBMovie';
import { basicRequest } from '~/server/TMDB/basicRequest';
import { diceCoefficient } from 'dice-coefficient';

export const movieRouter = createTRPCRouter({
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      // search for both movies and collections in tmdb
      const [moviesJSON, collectionsJSON] = await Promise.all([
        basicRequest(`search/movie?query=${input.query}&language=en-US`),
        basicRequest(`search/collection?query=${input.query}&language=en-US`),
      ]);

      try {
        const parsedMovies = TMDBMovieSearchResult.parse(
          moviesJSON.result,
        ).results;
        const parsedCollections = TMDBCollectionSearchResult.parse(
          collectionsJSON.result,
        ).results;

        return [...parsedMovies, ...parsedCollections]
          .map((i) => ({
            ...i,
            similarity: diceCoefficient(
              input.query,
              'title' in i ? i.title : i.name,
            ),
          }))
          .sort((a, b) => {
            if (a.similarity > b.similarity) return -1;
            if (a.similarity < b.similarity) return 1;
            return 0;
          });
      } catch (e) {
        console.error(e);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong searching TMDB.',
        });
      }
    }),
});
