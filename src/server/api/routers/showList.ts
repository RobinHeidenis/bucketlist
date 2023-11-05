import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { z } from 'zod';
import { checkIfExistsAndAccess } from '~/server/utils/checkIfExistsAndAccess';
import { TRPCError } from '@trpc/server';
import { getAndUpdateOrCreateShow } from '~/server/api/routers/utils/getAndUpdateOrCreateShow';

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

      const show = await ctx.prisma.show.findUnique({
        where: { id: input.showId },
        select: { id: true, updatedAt: true },
      });

      if (
        !show ||
        show.updatedAt < new Date(Date.now() - 1000 * 60 * 60 * 24)
      ) {
        await getAndUpdateOrCreateShow(ctx.prisma, input.showId);
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
