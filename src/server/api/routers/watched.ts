import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc';
import { convertImageHash } from '~/server/api/routers/utils/getList/convertImageHash';

export const watchedRouter = createTRPCRouter({
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
});
