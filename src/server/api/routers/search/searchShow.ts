import { z } from 'zod';
import { basicRequest } from '~/server/TMDB/basicRequest';
import { TRPCError } from '@trpc/server';
import { TMDBTVShowSearchResult } from '~/types/TMDBMovie';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

const zQuerySchema = z.object({
  query: z.string().min(1),
});

export const searchShow = async ({
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zQuerySchema>;
}) => {
  const showsJSON = await basicRequest(
    `search/tv?query=${encodeURIComponent(input.query)}&language=en-US`,
  ).catch((e) => {
    console.error(e);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong searching TMDB.',
    });
  });

  try {
    return TMDBTVShowSearchResult.parse(showsJSON.result).results;
  } catch (e) {
    console.error(e);
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: 'Something went wrong searching TMDB.',
    });
  }
};

export const searchShowProcedure = protectedProcedure
  .input(zQuerySchema)
  .query(searchShow);
