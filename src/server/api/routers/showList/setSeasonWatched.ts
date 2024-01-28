import { z } from 'zod';
import { checkIfExistsAndAccess } from '~/server/utils/checkIfExistsAndAccess';
import { TRPCError } from '@trpc/server';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

const zSetSeasonWatchedSchema = z.object({
  seasonNumber: z.number(),
  showId: z.number(),
  listId: z.string().uuid(),
  checked: z.boolean(),
});

export const setSeasonWatched = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zSetSeasonWatchedSchema>;
}) => {
  const list = await ctx.prisma.list.findUnique({
    where: { id: input.listId },
    select: {
      ownerId: true,
      type: true,
      collaborators: { select: { id: true } },
      checkedEpisodes: {
        where: {
          episode: {
            season: {
              seasonNumber: input.seasonNumber,
              show: { id: input.showId },
            },
          },
        },
      },
      shows: {
        where: { id: input.showId },
        include: {
          seasons: {
            where: { seasonNumber: input.seasonNumber },
            include: { episodes: true },
          },
        },
      },
    },
  });

  checkIfExistsAndAccess(ctx, list, 'SHOW');

  return ctx.prisma.$transaction(async (prisma) => {
    await prisma.list.update({
      where: { id: input.listId },
      data: { updatedAt: new Date() },
    });

    if (
      !list.shows[0]?.seasons.some((s) => s.seasonNumber === input.seasonNumber)
    ) {
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Season not found',
      });
    }

    if (input.checked) {
      return prisma.checkedEpisode.createMany({
        data:
          list.shows[0].seasons[0]?.episodes
            .filter(
              (e) => !list.checkedEpisodes.find((c) => c.episodeId === e.id),
            )
            .map((e) => ({
              episodeId: e.id,
              listId: input.listId,
            })) ?? [],
      });
    } else {
      return prisma.checkedEpisode.deleteMany({
        where: {
          episodeId: {
            in: list.shows[0].seasons[0]?.episodes.map((e) => e.id) ?? [],
          },
          listId: input.listId,
        },
      });
    }
  });
};

export const setSeasonWatchedProcedure = protectedProcedure
  .input(zSetSeasonWatchedSchema)
  .mutation(setSeasonWatched);
