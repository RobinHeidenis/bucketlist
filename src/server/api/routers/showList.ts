import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { z } from 'zod';
import { checkIfExistsAndAccess } from './movieList';
import { TRPCError } from '@trpc/server';
import { getShow } from '~/server/TMDB/getShow';
import { getSeasons } from '~/server/TMDB/getSeason';

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
        select: { ownerId: true, collaborators: { select: { id: true } } },
      });

      checkIfExistsAndAccess(ctx, list);

      await ctx.prisma.list.update({
        where: { id: input.listId },
        data: { updatedAt: new Date() },
      });

      if (input.checked) {
        return ctx.prisma.checkedEpisode.create({
          data: {
            list: { connect: { id: input.listId } },
            episode: { connect: { id: input.id } },
          },
        });
      }

      return ctx.prisma.checkedEpisode.delete({
        where: {
          episodeId_listId: { listId: input.listId, episodeId: input.id },
        },
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

      if (
        !checkIfExistsAndAccess(ctx, list) ||
        !list.shows[0]?.seasons.some(
          (s) => s.seasonNumber === input.seasonNumber,
        )
      ) {
        throw new Error('Not found');
      }

      await ctx.prisma.list.update({
        where: { id: input.listId },
        data: { updatedAt: new Date() },
      });

      if (input.checked) {
        return ctx.prisma.checkedEpisode.createMany({
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
      }

      return ctx.prisma.checkedEpisode.deleteMany({
        where: {
          episodeId: {
            in: [list.shows[0].seasons[0]?.episodes.map((e) => e.id) ?? []],
          },
          listId: input.listId,
        },
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
          ownerId: true,
          collaborators: { select: { id: true } },
          type: true,
          shows: { where: { id: input.showId }, select: { id: true } },
        },
      });

      if (!checkIfExistsAndAccess(ctx, list)) return;

      if (list.type !== 'SHOW')
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You can only add shows to this list.',
        });

      if (list.shows.length) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'This show is already on this list.',
        });
      }

      let show = await ctx.prisma.show.findUnique({
        where: { id: input.showId },
        select: { id: true },
      });

      if (!show) {
        const tmdbShow = await getShow(input.showId);
        if (!tmdbShow)
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Something went wrong finding that show on TMDB.',
          });

        const { result, eTag } = tmdbShow;

        await ctx.prisma.$transaction(async (prisma) => {
          show = await prisma.show.create({
            data: {
              id: result.id,
              title: result.name,
              description: result.overview,
              genres: result.genres?.map((g) => g.name).join(', ') ?? '',
              rating: result.vote_average?.toString() ?? 'Unknown',
              posterUrl: result.poster_path,
              releaseDate: result.first_air_date ?? 'Unknown',
              etag: eTag,
            },
          });

          if (!show)
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Something went wrong finding that show on TMDB.',
            });

          const seasons = await getSeasons(
            input.showId,
            result.number_of_seasons ?? 1,
          );

          if (!seasons)
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: 'Something went wrong finding that show on TMDB.',
            });

          await prisma.season.createMany({
            data: seasons.result.map((s) => ({
              id: s.id,
              seasonNumber: s.season_number ?? 0,
              title: s.name,
              overview: s.overview,
              posterUrl: s.poster_path,
              releaseDate: s.air_date ?? 'Unknown',
              showId: input.showId,
            })),
          });

          await prisma.episode.createMany({
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
          });
        });
      }

      return ctx.prisma.list.update({
        where: { id: input.listId },
        data: {
          shows: {
            connect: { id: input.showId },
          },
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
        select: { ownerId: true, collaborators: { select: { id: true } } },
      });

      if (!checkIfExistsAndAccess(ctx, list)) return;

      await ctx.prisma.checkedEpisode.deleteMany({
        where: {
          AND: [
            { listId: input.listId },
            { episode: { season: { showId: input.showId } } },
          ],
        },
      });

      return ctx.prisma.list.update({
        where: { id: input.listId },
        data: {
          shows: {
            disconnect: { id: input.showId },
          },
        },
      });
    }),
});
