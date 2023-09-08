import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { z } from 'zod';
import { checkIfExistsAndAccess } from '~/server/utils/checkIfExistsAndAccess';
import { TRPCError } from '@trpc/server';
import { getShow } from '~/server/TMDB/getShow';
import { getSeasons } from '~/server/TMDB/getSeason';
import { convertImageToHash } from '~/utils/convertImageToHash';

export const showListRouter = createTRPCRouter({
  setEpisodeWatched: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        listId: z.string().uuid(),
        checked: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.listId },
        select: {
          ownerId: true,
          type: true,
          collaborators: { select: { id: true } },
        },
      });

      checkIfExistsAndAccess(ctx, list, 'SHOW');

      return await ctx.prisma.$transaction(async (prisma) => {
        await prisma.list.update({
          where: { id: input.listId },
          data: { updatedAt: new Date() },
        });

        if (input.checked) {
          return prisma.checkedEpisode.create({
            data: {
              list: { connect: { id: input.listId } },
              episode: { connect: { id: input.id } },
            },
          });
        } else {
          return prisma.checkedEpisode.delete({
            where: {
              episodeId_listId: { listId: input.listId, episodeId: input.id },
            },
          });
        }
      });
    }),
  setSeasonWatched: protectedProcedure
    .input(
      z.object({
        seasonNumber: z.number(),
        showId: z.number(),
        listId: z.string().uuid(),
        checked: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
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

      return await ctx.prisma.$transaction(async (prisma) => {
        await prisma.list.update({
          where: { id: input.listId },
          data: { updatedAt: new Date() },
        });

        if (
          !list.shows[0]?.seasons.some(
            (s) => s.seasonNumber === input.seasonNumber,
          )
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
                  (e) =>
                    !list.checkedEpisodes.find((c) => c.episodeId === e.id),
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
    }),
  createShow: protectedProcedure
    .input(
      z.object({
        showId: z.number(),
        listId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.listId },
        select: {
          _count: { select: { shows: { where: { id: input.showId } } } },
          ownerId: true,
          collaborators: { select: { id: true } },
          type: true,
        },
      });

      checkIfExistsAndAccess(ctx, list, 'SHOW');

      if (list._count.shows) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'This show is already on this list.',
        });
      }

      const show = await ctx.prisma.show.count({
        where: { id: input.showId },
      });

      if (!show) {
        const { result, eTag } = await getShow(input.showId);
        const seasons = await getSeasons(
          input.showId,
          result.number_of_seasons ?? 1,
        );

        await ctx.prisma.$transaction([
          ctx.prisma.show.create({
            data: {
              id: result.id,
              title: result.name,
              description: result.overview,
              genres: result.genres?.map((g) => g.name).join(', ') ?? '',
              rating: result.vote_average?.toString() ?? 'Unknown',
              posterUrl: result.poster_path,
              imageHash: result.poster_path
                ? Buffer.from(
                    await convertImageToHash(
                      'https://image.tmdb.org/t/p/w500' + result.poster_path,
                    ),
                  )
                : undefined,
              releaseDate: result.first_air_date ?? 'Unknown',
              etag: eTag,
            },
          }),
          ctx.prisma.season.createMany({
            data: seasons.result.map((s) => ({
              id: s.id,
              seasonNumber: s.season_number ?? 0,
              title: s.name,
              overview: s.overview,
              posterUrl: s.poster_path,
              releaseDate: s.air_date ?? 'Unknown',
              showId: input.showId,
            })),
          }),
          ctx.prisma.episode.createMany({
            data: seasons.result.flatMap(
              (s) =>
                s.episodes?.map((e) => ({
                  id: e.id,
                  episodeNumber: e.episode_number,
                  title: e.name,
                  overview: e.overview?.slice(0, 999),
                  releaseDate: e.air_date ?? 'Unknown',
                  seasonId: s.id,
                })) ?? [],
            ),
          }),
        ]);
      }

      return ctx.prisma.list.update({
        where: { id: input.listId },
        data: {
          shows: {
            connect: { id: input.showId },
          },
          updatedAt: new Date(),
        },
      });
    }),
  deleteShow: protectedProcedure
    .input(
      z.object({
        showId: z.number(),
        listId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.listId },
        select: {
          ownerId: true,
          type: true,
          collaborators: { select: { id: true } },
        },
      });

      checkIfExistsAndAccess(ctx, list, 'SHOW');

      const [updatedList] = await ctx.prisma.$transaction([
        ctx.prisma.list.update({
          where: { id: input.listId },
          data: {
            shows: {
              disconnect: { id: input.showId },
            },
            updatedAt: new Date(),
          },
        }),
        ctx.prisma.checkedEpisode.deleteMany({
          where: {
            AND: [
              { listId: input.listId },
              { episode: { season: { showId: input.showId } } },
            ],
          },
        }),
      ]);

      return updatedList;
    }),
});
