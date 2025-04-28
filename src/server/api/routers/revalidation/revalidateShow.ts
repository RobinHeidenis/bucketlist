import { z } from 'zod';
import type { AuthedTRPCContext } from '../../trpc';
import { protectedProcedure } from '../../trpc';
import { TRPCError } from '@trpc/server';
import { createTmdbService } from '~/server/TMDB/tmdbService';
import { TmdbClient } from '~/server/TMDB/tmdbClient';
import { env } from '~/env.mjs';
import { TmdbApi } from '~/server/TMDB/tmdbApi';

const zRevalidateShowSchema = z.object({
  showId: z.number(),
});

export const revalidateShow = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zRevalidateShowSchema>;
}) => {
  const show = await ctx.prisma.show.findUnique({
    where: { id: input.showId },
    select: {
      id: true,
    },
  });

  if (!show) {
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Show not found',
    });
  }

  const tmdbService = createTmdbService(ctx.prisma);
  const tmdbClient = new TmdbClient(env.TMDB_API_KEY);
  const tmdbApi = new TmdbApi(tmdbClient);
  const { result, response } = await tmdbApi.getShowById(input.showId);
  console.log(result);
  await tmdbService.parseAndCreateShow(result, response, input.showId, true);

  await ctx.prisma.show.update({
    where: { id: show.id },
    data: {
      updatedAt: new Date(),
    },
  });

  // revalidate all lists that have this show
  await ctx.prisma.list.updateMany({
    where: { shows: { some: { id: show.id } } },
    data: {
      updatedAt: new Date(),
    },
  });

  return { success: true };
};

export const revalidateShowProcedure = protectedProcedure
  .input(zRevalidateShowSchema)
  .mutation(revalidateShow);
