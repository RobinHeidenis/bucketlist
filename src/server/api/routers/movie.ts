import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { env } from '~/env.mjs';
import {
  TMDBCollectionSearchResult,
  TMDBMovieSearchResult,
} from '~/types/TMDBMovie';

export const movieRouter = createTRPCRouter({
  search: protectedProcedure
    .input(
      z.object({
        query: z.string().min(1),
      }),
    )
    .query(async ({ input }) => {
      // search for both movies and collections in tmdb
      const [movieRes, collectionRes] = await Promise.all([
        fetch(
          `https://api.themoviedb.org/3/search/movie?query=${input.query}&language=en-US`,
          {
            headers: {
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              Authorization: `Bearer ${env.TMDB_API_KEY ?? ''}`,
            },
          },
        ),
        fetch(
          `https://api.themoviedb.org/3/search/collection?query=${input.query}&language=en-US`,
          {
            headers: {
              // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
              Authorization: `Bearer ${env.TMDB_API_KEY ?? ''}`,
            },
          },
        ),
      ]);

      if (!movieRes.ok || !collectionRes.ok) {
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong searching TMDB.',
        });
      }

      try {
        const parsedMovies = TMDBMovieSearchResult.parse(
          await movieRes.json(),
        ).results;
        const parsedCollections = TMDBCollectionSearchResult.parse(
          await collectionRes.json(),
        ).results;

        return [...parsedMovies, ...parsedCollections].sort((a, b) => {
          let aTitle;
          if ('title' in a) aTitle = a.title;
          else aTitle = a.name;

          let bTitle;
          if ('title' in b) bTitle = b.title;
          else bTitle = b.name;

          if (aTitle < bTitle) return -1;
          if (aTitle > bTitle) return 1;
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
