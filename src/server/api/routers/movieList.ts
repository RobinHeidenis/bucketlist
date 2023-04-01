import type { createTRPCContext } from '../trpc';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { zNewMovieSchema } from '~/schemas/listSchemas';
import { TRPCError } from '@trpc/server';
import type { Collection, List, User } from '@prisma/client';
import {
  checkAndUpdateCollection,
  checkAndUpdateMovie,
  createDBMovieFromTMDBMovie,
  getTMDBMovie,
} from '../../tmdbApi';

const checkAccess = (
  ctx: Awaited<ReturnType<typeof createTRPCContext>>,
  list: Partial<List & { collaborators: Pick<User, 'id'>[] }>,
) =>
  list.ownerId === ctx.session?.user?.id ||
  list.collaborators?.some((c) => c.id === ctx.session?.user?.id);

const checkIfExistsAndAccess = (
  ctx: Awaited<ReturnType<typeof createTRPCContext>>,
  list:
    | Partial<List & { collaborators: Pick<User, 'id'>[] }>
    | undefined
    | null,
): list is Partial<List & { collaborators: Pick<User, 'id'>[] }> => {
  if (!list)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'That list cannot be found.',
    });

  if (!checkAccess(ctx, list))
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You are not allowed to update this entity.',
    });

  return true;
};

export const movieListRouter = createTRPCRouter({
  setMovieWatched: protectedProcedure
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

      if (input.checked) {
        return ctx.prisma.checkedMovie.create({
          data: {
            list: { connect: { id: input.listId } },
            movie: { connect: { id: input.id } },
          },
        });
      }

      return ctx.prisma.checkedMovie.delete({
        where: { movieId_listId: { listId: input.listId, movieId: input.id } },
      });
    }),
  setCollectionChecked: protectedProcedure
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
          collaborators: { select: { id: true } },
          collections: { where: { id: input.id }, include: { movies: true } },
        },
      });

      if (
        !checkIfExistsAndAccess(ctx, list) ||
        !list.collections[0]?.movies.length
      )
        return;

      if (input.checked) {
        const movies = list.collections[0].movies.map((movie) => ({
          id: movie.id,
        }));

        return ctx.prisma.checkedMovie.createMany({
          data: movies.map((movie) => ({
            listId: input.listId,
            movieId: movie.id,
          })),
        });
      }

      return ctx.prisma.checkedMovie.deleteMany({
        where: {
          listId: input.listId,
          movieId: { in: list.collections[0].movies.map((movie) => movie.id) },
        },
      });
    }),
  createMovie: protectedProcedure
    .input(zNewMovieSchema)
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.listId },
        select: {
          ownerId: true,
          collaborators: { select: { id: true } },
          type: true,
        },
      });

      if (!checkIfExistsAndAccess(ctx, list)) return;

      if (list.type !== 'MOVIE')
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You can only add movie list items to this list.',
        });

      let movie = await ctx.prisma.movie.findUnique({
        where: { id: input.externalId },
      });

      if (!movie) {
        const tmdbMovie = await getTMDBMovie(input.externalId);
        if (!tmdbMovie)
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Something went wrong finding that movie on TMDB.',
          });

        movie = await ctx.prisma.movie.create({
          data: {
            ...createDBMovieFromTMDBMovie(tmdbMovie.json, tmdbMovie.etag),
          },
        });
      }

      await checkAndUpdateMovie(ctx, movie);

      return ctx.prisma.list.update({
        where: { id: input.listId },
        data: {
          movies: { connect: { id: movie.id } },
        },
      });
    }),
  createCollection: protectedProcedure
    .input(zNewMovieSchema)
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.listId },
        select: {
          ownerId: true,
          collaborators: { select: { id: true } },
          type: true,
        },
      });

      if (!checkIfExistsAndAccess(ctx, list)) return;

      if (list.type !== 'MOVIE')
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You can only add movie list items to this list.',
        });

      let collection: Collection | null | undefined =
        await ctx.prisma.collection.findUnique({
          where: { id: input.externalId },
          include: { movies: { select: { id: true } } },
        });

      if (!collection) {
        collection = await checkAndUpdateCollection(
          ctx,
          collection ?? { id: input.externalId, updatedAt: new Date() },
        );
      }

      if (!collection)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Something went wrong finding that collection on TMDB.',
        });

      await checkAndUpdateCollection(ctx, collection);

      return ctx.prisma.list.update({
        where: { id: input.listId },
        data: {
          collections: { connect: { id: collection.id } },
        },
      });
    }),
  deleteMovie: protectedProcedure
    .input(z.object({ id: z.number(), listId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.listId },
        select: { ownerId: true, collaborators: { select: { id: true } } },
      });

      if (!checkIfExistsAndAccess(ctx, list)) return;

      await ctx.prisma.checkedMovie.deleteMany({
        where: {
          AND: [{ movieId: input.id }, { listId: input.listId }],
        },
      });

      return ctx.prisma.list.update({
        where: { id: input.listId },
        data: {
          movies: { disconnect: { id: input.id } },
        },
      });
    }),
  deleteCollection: protectedProcedure
    .input(z.object({ id: z.number(), listId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.listId },
        select: {
          ownerId: true,
          collaborators: { select: { id: true } },
          collections: {
            select: { movies: { select: { id: true } } },
            where: { id: input.id },
          },
        },
      });

      if (!checkIfExistsAndAccess(ctx, list)) return;

      if (!list.collections[0])
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            "The collection you're requesting to delete cannot be found.",
        });

      await ctx.prisma.checkedMovie.deleteMany({
        where: {
          AND: [
            { movieId: { in: list.collections[0].movies.map((m) => m.id) } },
            { listId: input.listId },
          ],
        },
      });

      return ctx.prisma.list.update({
        where: { id: input.listId },
        data: {
          collections: { disconnect: { id: input.id } },
        },
      });
    }),
});
