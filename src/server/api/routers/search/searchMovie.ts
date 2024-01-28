import { z } from 'zod';
import { basicRequest } from '~/server/TMDB/basicRequest';
import { TRPCError } from '@trpc/server';
import {
  TMDBCollectionSearchResult,
  TMDBMovieSearchResult,
} from '~/types/TMDBMovie';
import { diceCoefficient } from 'dice-coefficient';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

const zQuerySchema = z.object({
  query: z.string().min(1),
});

export const searchMovie = async ({
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zQuerySchema>;
}) => {
  const sanitizedQuery = encodeURIComponent(input.query);

  // search for both movies and collections in tmdb
  const [moviesJSON, collectionsJSON] = await Promise.all([
    basicRequest(`search/movie?query=${sanitizedQuery}&language=en-US`),
    basicRequest(`search/collection?query=${sanitizedQuery}&language=en-US`),
  ]).catch((e) => {
    console.error(e);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong searching TMDB.',
    });
  });

  try {
    const parsedMovies = TMDBMovieSearchResult.parse(moviesJSON.result).results;
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
};

export const searchMovieProcedure = protectedProcedure
  .input(zQuerySchema)
  .query(searchMovie);
