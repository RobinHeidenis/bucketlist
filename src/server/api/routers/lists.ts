import {
  zEditListSchema,
  zIdSchema,
  zNewListSchema,
  zSetIsPublicSchema,
} from '~/schemas/listSchemas';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import type {
  BucketList,
  DBMovieList,
  MovieList,
  MovieListCollection,
  MovieListMovie,
  ShowList,
} from '~/types/List';
import { isBucketList, isMovieList, isShowList } from '~/types/List';
import { clerkClient } from '@clerk/nextjs';
import { z } from 'zod';

export const listsRouter = createTRPCRouter({
  getLists: protectedProcedure.query(async ({ ctx }) => {
    const lists = await ctx.prisma.list.findMany({
      where: {
        OR: [
          { ownerId: ctx.auth.userId },
          { collaborators: { some: { id: ctx.auth.userId } } },
        ],
      },
      include: {
        bucketListItems: { select: { checked: true } },
        _count: {
          select: {
            checkedMovies: true,
            movies: true,
            shows: true,
            checkedEpisodes: true,
          },
        },
        collections: { include: { _count: { select: { movies: true } } } },
        collaborators: { select: { id: true } },
      },
      orderBy: { title: 'asc' },
    });

    return lists.map((list) => {
      const baseList = {
        id: list.id,
        title: list.title,
        description: list.description,
        collaborators: list.collaborators,
        isPublic: list.isPublic,
        updatedAt: list.updatedAt,
        type: list.type,
        ownerId: list.ownerId,
      };

      if (list.type === 'BUCKET')
        return {
          ...baseList,
          amountChecked: list.bucketListItems.filter((i) => i.checked).length,
          amount: list.bucketListItems.length,
        };
      else if (list.type === 'MOVIE')
        return {
          ...baseList,
          amountChecked: list._count.checkedMovies,
          amount:
            list._count.movies +
            list.collections
              .map((c) => c._count.movies)
              .reduce((a, b) => a + b, 0),
        };
      else
        return {
          ...baseList,
          amountChecked: list._count.checkedEpisodes,
          amount: list._count.shows,
        };
    });
  }),
  getList: protectedProcedure
    .input(
      zIdSchema.extend({
        updatedAt: z.string().datetime().nullable().optional(),
      }),
    )
    .query(
      async ({
        ctx,
        input,
      }): Promise<
        | BucketList
        | MovieList
        | ShowList
        | {
            id: string;
            updatedAt: string;
            code: 'NOT_MODIFIED';
          }
      > => {
        if (input.updatedAt) {
          const list = await ctx.prisma.list.findUnique({
            where: { id: input.id },
            select: { updatedAt: true },
          });

          if (!list)
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: "The list you're requesting cannot be found.",
            });

          if (input.updatedAt === list.updatedAt.toISOString()) {
            return {
              id: input.id,
              updatedAt: list.updatedAt.toISOString(),
              code: 'NOT_MODIFIED',
            };
          }
        }

        const listType = await ctx.prisma.list.findUnique({
          where: { id: input.id },
          select: { type: true },
        });

        if (!listType)
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: "The list you're requesting cannot be found.",
          });

        let list;

        if (listType.type === 'BUCKET')
          list = await ctx.prisma.list.findUnique({
            where: { id: input.id },
            include: {
              bucketListItems: {
                orderBy: [{ title: 'asc' }, { checked: 'asc' }],
              },
              collaborators: { select: { id: true } },
              owner: { select: { id: true } },
            },
          });
        else if (listType.type === 'MOVIE')
          list = await ctx.prisma.list.findUnique({
            where: { id: input.id },
            include: {
              movies: true,
              collections: { include: { movies: true } },
              checkedMovies: true,
              owner: { select: { id: true } },
              collaborators: { select: { id: true } },
            },
          });
        else
          list = await ctx.prisma.list.findUnique({
            where: { id: input.id },
            include: {
              shows: { include: { seasons: { include: { episodes: true } } } },
              checkedEpisodes: true,
              owner: { select: { id: true } },
              collaborators: { select: { id: true } },
            },
          });

        if (!list)
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: "The list you're requesting cannot be found.",
          });

        if (
          list.ownerId !== ctx.auth.userId &&
          !list.isPublic &&
          !list.collaborators.find(
            (collaborator) => collaborator.id === ctx.auth.userId,
          )
        )
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'You do not have access to view this list.',
          });

        const { firstName, lastName, externalAccounts } =
          await clerkClient.users.getUser(list.ownerId).catch(() => ({
            firstName: null,
            lastName: null,
            externalAccounts: [],
          }));

        const base = {
          id: list.id,
          title: list.title,
          description: list.description,
          isPublic: list.isPublic,
          type: list.type,
          owner: {
            id: list.ownerId,
            name:
              (`${firstName ?? ''} ${lastName ?? ''}`.trim() ||
                externalAccounts[0]?.firstName) ??
              "User that somehow doesn't have a name or a connected account",
          },
          collaborators: list.collaborators,
        };

        if (isBucketList(list)) {
          return {
            ...base,
            bucketListItems: list.bucketListItems,
            updatedAt: list.updatedAt,
            total: list.bucketListItems.length,
            totalChecked: list.bucketListItems.filter((item) => item.checked)
              .length,
          };
        }

        if (isMovieList(list)) {
          const checkedMoviesSet = new Set(
            (list as DBMovieList).checkedMovies.map((m) => m.movieId),
          );

          const collections = list.collections.map((collection) => {
            // Filter movies on having a release date, as this is usually a good indicator of if the movie is at all confirmed or just a speculation.
            const filteredMovies = collection.movies.filter(
              (movie) => movie.releaseDate,
            );

            const checkedMoviesInCollection = filteredMovies.filter((movie) =>
              checkedMoviesSet.has(movie.id),
            );

            return {
              ...collection,
              imageHash: collection.imageHash?.toString() ?? null,
              movies: filteredMovies.map((movie) => ({
                ...movie,
                imageHash: movie.imageHash?.toString() ?? null,
                checked: checkedMoviesSet.has(movie.id),
              })),
              allChecked:
                checkedMoviesInCollection.length === filteredMovies.length,
              amountChecked: checkedMoviesInCollection.length,
            } satisfies MovieListCollection;
          });

          const moviesWithCheckedFlag = list.movies.map(
            (movie) =>
              ({
                ...movie,
                imageHash: movie.imageHash?.toString() ?? null,
                checked: checkedMoviesSet.has(movie.id),
              }) satisfies MovieListMovie,
          );

          return {
            ...base,
            collections: collections,
            movies: moviesWithCheckedFlag,
            total:
              moviesWithCheckedFlag.length +
              collections.reduce((sum, c) => sum + c.movies.length, 0),
            totalChecked: checkedMoviesSet.size,
            updatedAt: list.updatedAt,
          } satisfies MovieList;
        }

        if (isShowList(list)) {
          const { checkedEpisodes, shows, updatedAt } = list;
          const checkedEpisodesSet = new Set(
            checkedEpisodes.map((e) => e.episodeId),
          );

          let total = 0;
          let totalChecked = 0;

          const updatedShows = shows.map((show) => {
            let showTotal = 0;
            let showTotalChecked = 0;

            const seasons = show.seasons
              .map((season) => {
                const episodes = season.episodes
                  .map((episode) => ({
                    ...episode,
                    checked: checkedEpisodesSet.has(episode.id),
                  }))
                  .sort((a, b) => a.episodeNumber - b.episodeNumber);

                const allChecked =
                  episodes.length > 0 &&
                  episodes.every((episode) =>
                    checkedEpisodesSet.has(episode.id),
                  );

                const amountChecked = episodes.filter(
                  (episode) => episode.checked,
                ).length;
                showTotal += season.episodes.length;
                showTotalChecked += amountChecked;

                return {
                  ...season,
                  episodes,
                  allChecked,
                  amountChecked,
                };
              })
              .filter((season) => season.episodes.length > 0)
              .sort((a, b) => a.seasonNumber - b.seasonNumber);

            total += showTotal;
            totalChecked += showTotalChecked;

            const allChecked = seasons.every((season) => season.allChecked);

            return {
              ...show,
              imageHash: show.imageHash?.toString() ?? null,
              seasons,
              allChecked,
              amountChecked: showTotalChecked,
            };
          });

          return {
            ...base,
            checkedEpisodes,
            shows: updatedShows,
            total,
            totalChecked,
            updatedAt,
          };
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Something went wrong.',
        });
      },
    ),
  createList: protectedProcedure
    .input(zNewListSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.list.create({
        data: {
          title: input.title,
          description: input.description,
          ownerId: ctx.auth.userId,
          type: input.type,
        },
      });
    }),
  deleteList: protectedProcedure
    .input(zIdSchema)
    .mutation(async ({ ctx, input }) => {
      const requestedList = await ctx.prisma.list.findUnique({
        where: { id: input.id },
        select: { ownerId: true },
      });

      if (!requestedList)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The list you're requesting to delete cannot be found.",
        });

      if (requestedList.ownerId !== ctx.auth.userId)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You do not have access to delete this list.',
        });

      return ctx.prisma.list.delete({ where: { id: input.id } });
    }),
  updateList: protectedProcedure
    .input(zEditListSchema)
    .mutation(async ({ ctx, input }) => {
      const requestedList = await ctx.prisma.list.findUnique({
        where: { id: input.id },
        select: { ownerId: true },
      });

      if (!requestedList)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The list you're requesting to update cannot be found.",
        });

      if (requestedList.ownerId !== ctx.auth.userId)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You do not have access to update this list.',
        });

      return ctx.prisma.list.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
        },
      });
    }),
  setPublic: protectedProcedure
    .input(zSetIsPublicSchema)
    .mutation(async ({ ctx, input }) => {
      const requestedList = await ctx.prisma.list.findUnique({
        where: { id: input.id },
        select: { ownerId: true },
      });

      if (!requestedList)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The list you're requesting to update cannot be found.",
        });

      if (requestedList.ownerId !== ctx.auth.userId)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You do not have access to update this list.',
        });

      return ctx.prisma.list.update({
        where: { id: input.id },
        data: {
          isPublic: input.isPublic,
        },
      });
    }),
  leaveList: protectedProcedure
    .input(zIdSchema)
    .mutation(async ({ ctx, input }) => {
      const requestedList = await ctx.prisma.list.findUnique({
        where: { id: input.id },
        select: {
          ownerId: true,
          collaborators: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!requestedList)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The list you're requesting to leave cannot be found.",
        });

      if (requestedList.ownerId === ctx.auth.userId)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You cannot leave a list you own.',
        });

      if (!requestedList.collaborators.find((c) => c.id === ctx.auth.userId))
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not a collaborator on this list.',
        });

      return ctx.prisma.list.update({
        where: { id: input.id },
        data: {
          collaborators: {
            disconnect: {
              id: ctx.auth.userId,
            },
          },
        },
      });
    }),
});
