import {
  zEditListSchema,
  zIdSchema,
  zNewListSchema,
  zSetIsPublicSchema,
} from '~/schemas/listSchemas';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import type { BucketList, DBMovieList, MovieList } from '~/types/List';
import { isBucketList } from '~/types/List';

export const listsRouter = createTRPCRouter({
  getLists: protectedProcedure.query(async ({ ctx }) => {
    const lists = await ctx.prisma.list.findMany({
      where: {
        OR: [
          { ownerId: ctx.session.user.id },
          { collaborators: { some: { id: ctx.session.user.id } } },
        ],
      },
      include: {
        bucketListItems: { select: { checked: true } },
        _count: { select: { checkedMovies: true, movies: true } },
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
      else
        return {
          ...baseList,
          amountChecked: list._count.checkedMovies,
          amount:
            list._count.movies +
            list.collections
              .map((c) => c._count.movies)
              .reduce((a, b) => a + b, 0),
        };
    });
  }),
  getList: protectedProcedure
    .input(zIdSchema)
    .query(async ({ ctx, input }): Promise<BucketList | MovieList> => {
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
            owner: { select: { id: true, name: true } },
          },
        });
      else
        list = await ctx.prisma.list.findUnique({
          where: { id: input.id },
          include: {
            movies: true,
            collections: { include: { movies: true } },
            checkedMovies: true,
            owner: { select: { id: true, name: true } },
            collaborators: { select: { id: true } },
          },
        });

      if (!list)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The list you're requesting cannot be found.",
        });

      if (
        list.ownerId !== ctx.session.user.id &&
        !list.isPublic &&
        !list.collaborators.find(
          (collaborator) => collaborator.id === ctx.session.user.id,
        )
      )
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You do not have access to view this list.',
        });

      if (isBucketList(list)) {
        const {
          id,
          title,
          description,
          isPublic,
          type,
          ownerId,
          owner,
          collaborators,
          bucketListItems,
          updatedAt,
        } = list;
        return {
          id,
          title,
          description,
          isPublic,
          type,
          ownerId,
          owner,
          collaborators,
          bucketListItems,
          updatedAt,
          total: bucketListItems.length,
          totalChecked: bucketListItems.filter((item) => item.checked).length,
        };
      }

      const {
        id,
        title,
        description,
        isPublic,
        type,
        ownerId,
        owner,
        collaborators,
        collections,
        movies,
        checkedMovies,
        updatedAt,
      } = list as DBMovieList;

      return {
        id,
        title,
        description,
        isPublic,
        type,
        ownerId,
        owner,
        collaborators,
        collections: collections.map((collection) => ({
          ...collection,
          movies: collection.movies.map((movie) => ({
            ...movie,
            checked: !!checkedMovies.find((m) => m.movieId === movie.id),
          })),
          allChecked: collection.movies.every((movie) =>
            checkedMovies.find((m) => m.movieId === movie.id),
          ),
          amountChecked: collection.movies.filter((movie) =>
            checkedMovies.find((m) => m.movieId === movie.id),
          ).length,
        })),
        movies: movies.map((movie) => ({
          ...movie,
          checked: !!checkedMovies.find((m) => m.movieId === movie.id),
        })),
        total:
          movies.length +
          collections.map((c) => c.movies.length).reduce((a, b) => a + b, 0),
        totalChecked: checkedMovies.length,
        updatedAt,
      };
    }),
  createList: protectedProcedure
    .input(zNewListSchema)
    .mutation(({ ctx, input }) => {
      return ctx.prisma.list.create({
        data: {
          title: input.title,
          description: input.description,
          ownerId: ctx.session.user.id,
          type: input.type,
        },
      });
    }),
  deleteList: protectedProcedure
    .input(zIdSchema)
    .mutation(async ({ ctx, input }) => {
      const requestedList = await ctx.prisma.list.findUnique({
        where: { id: input.id },
      });

      if (!requestedList)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The list you're requesting to delete cannot be found.",
        });
      if (requestedList.ownerId !== ctx.session.user.id)
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You do not have access to delete this list.',
        });

      return await ctx.prisma.list.delete({ where: { id: input.id } });
    }),
  updateList: protectedProcedure
    .input(zEditListSchema)
    .mutation(async ({ ctx, input }) => {
      const requestedList = await ctx.prisma.list.findUnique({
        where: { id: input.id },
      });

      if (!requestedList)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The list you're requesting to update cannot be found.",
        });
      if (requestedList.ownerId !== ctx.session.user.id)
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
      });

      if (!requestedList)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The list you're requesting to update cannot be found.",
        });
      if (requestedList.ownerId !== ctx.session.user.id)
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
});
