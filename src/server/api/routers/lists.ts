import {
  zEditListSchema,
  zIdSchema,
  zNewListSchema,
  zSetIsPublicSchema,
} from '~/schemas/listSchemas';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { TRPCError } from '@trpc/server';
import type { BucketList, MovieList, ShowList } from '~/types/List';
import { isBucketList, isMovieList, isShowList } from '~/types/List';
import { clerkClient } from '@clerk/nextjs';
import { getListBase } from '~/server/api/routers/utils/getList/list';
import {
  formatMovieList,
  getMovieList,
} from '~/server/api/routers/utils/getList/movieList';
import {
  formatShowList,
  getShowList,
} from '~/server/api/routers/utils/getList/showList';
import { getBucketList } from '~/server/api/routers/utils/getList/bucketList';

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
    .input(zIdSchema)
    .query(
      async ({
        ctx,
        input,
      }): Promise<BucketList | MovieList | ShowList | undefined> => {
        if (ctx.req.headers['if-modified-since']) {
          const list = await ctx.prisma.list.findUnique({
            where: { id: input.id },
            select: { updatedAt: true },
          });

          if (!list)
            throw new TRPCError({
              code: 'NOT_FOUND',
              message: "The list you're requesting cannot be found.",
            });

          if (
            ctx.req.headers['if-modified-since'] ===
            list.updatedAt.toISOString()
          ) {
            ctx.res.setHeader('Last-Modified', list.updatedAt.toISOString());
            ctx.res.statusCode = 304;
            return;
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
          list = await getBucketList(ctx.prisma, input.id);
        else if (listType.type === 'MOVIE')
          list = await getMovieList(ctx.prisma, input.id);
        else list = await getShowList(ctx.prisma, input.id);

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

        const clerkOwner = await clerkClient.users
          .getUser(list.ownerId)
          .catch(() => ({
            firstName: null,
            lastName: null,
            externalAccounts: [],
          }));

        const base = getListBase(list, clerkOwner);

        ctx.res.setHeader('Last-Modified', list.updatedAt.toISOString());

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

        if (isMovieList(list)) return formatMovieList(list, base);

        if (isShowList(list)) return formatShowList(list, base);

        // If the list is somehow not one of the three types, throw an error.
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
