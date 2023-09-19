import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { convertImageHash } from '~/server/api/routers/utils/getList/convertImageHash';
import { z } from 'zod';

export const watchedRouter = createTRPCRouter({
  markItemAsWatched: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        type: z.enum(['movie', 'episode']),
        watchedAt: z.date().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.type === 'movie') {
        return ctx.prisma.watchedMovie.create({
          data: {
            watchedAt: input.watchedAt,
            movie: {
              connect: {
                id: input.id,
              },
            },
            user: {
              connect: {
                id: ctx.auth.userId,
              },
            },
          },
        });
      }

      return ctx.prisma.watchedEpisode.create({
        data: {
          watchedAt: input.watchedAt,
          episode: {
            connect: {
              id: input.id,
            },
          },
          user: {
            connect: {
              id: ctx.auth.userId,
            },
          },
        },
      });
    }),
  getAllWatchInstances: protectedProcedure.query(async ({ ctx }) => {
    const movies = await ctx.prisma.movie.findMany({
      where: { watchedBy: { some: { userId: ctx.auth.userId } } },
      select: {
        id: true,
        title: true,
        description: true,
        posterUrl: true,
        imageHash: true,
        watchedBy: {
          where: { userId: ctx.auth.userId },
          select: {
            watchedAt: true,
            id: true,
          },
        },
      },
    });

    const shows = await ctx.prisma.show.findMany({
      where: {
        seasons: {
          some: {
            episodes: {
              some: { watchedBy: { some: { userId: ctx.auth.userId } } },
            },
          },
        },
      },
      select: {
        id: true,
        title: true,
        description: true,
        posterUrl: true,
        imageHash: true,
        seasons: {
          select: {
            _count: {
              select: {
                episodes: true,
              },
            },
            episodes: {
              where: {
                watchedBy: { some: { userId: ctx.auth.userId } },
              },
              select: {
                id: true,
                watchedBy: {
                  select: {
                    id: true,
                    watchedAt: true,
                  },
                  where: { userId: ctx.auth.userId },
                },
              },
            },
          },
        },
      },
    });

    return {
      movies: movies.map((m) => ({
        ...m,
        imageHash: convertImageHash(m.imageHash),
      })),
      shows: shows.map((s) => {
        const { seasons, ...show } = s;
        const watchedEpisodes = seasons
          .filter((s) => s.episodes.length)
          .flatMap((s) => s.episodes);

        const totalEpisodes = seasons.reduce(
          (acc, curr) => acc + curr._count.episodes,
          0,
        );

        return {
          ...show,
          imageHash: convertImageHash(s.imageHash),
          watchedEpisodes,
          totalEpisodes,
        };
      }),
    };
  }),
  deleteWatchInstance: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        type: z.enum(['movie', 'episode']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.type === 'movie') {
        return ctx.prisma.watchedMovie.delete({
          where: {
            id: input.id,
          },
        });
      }

      return ctx.prisma.watchedEpisode.delete({
        where: {
          id: input.id,
        },
      });
    }),
  deleteAllWatchInstances: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        type: z.enum(['movie', 'episode']),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (input.type === 'movie') {
        return ctx.prisma.watchedMovie.deleteMany({
          where: {
            AND: [
              {
                movieId: input.id,
              },
              {
                userId: ctx.auth.userId,
              },
            ],
          },
        });
      }

      return ctx.prisma.watchedEpisode.deleteMany({
        where: {
          AND: [
            {
              episodeId: input.id,
            },
            {
              userId: ctx.auth.userId,
            },
          ],
        },
      });
    }),
});
