import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { zNewMovieSchema } from '~/schemas/listSchemas';
import { TRPCError } from '@trpc/server';
import type { Collection } from '@prisma/client';
import { checkAndUpdateCollection, checkAndUpdateMovie } from '../../tmdbApi';
import { getMovie, transformAPIMovie } from '~/server/TMDB/getMovie';
import { checkIfExistsAndAccess } from '~/server/utils/checkIfExistsAndAccess';

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
        select: {
          ownerId: true,
          type: true,
          collaborators: { select: { id: true } },
        },
      });

      checkIfExistsAndAccess(ctx, list, 'MOVIE');

      return await ctx.prisma.$transaction(async (prisma) => {
        await prisma.list.update({
          where: { id: input.listId },
          data: { updatedAt: new Date() },
        });

        if (input.checked) {
          return await prisma.checkedMovie.create({
            data: {
              list: { connect: { id: input.listId } },
              movie: { connect: { id: input.id } },
            },
          });
        } else {
          return await prisma.checkedMovie.delete({
            where: {
              movieId_listId: { listId: input.listId, movieId: input.id },
            },
          });
        }
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
          type: true,
          collaborators: { select: { id: true } },
          collections: { where: { id: input.id }, include: { movies: true } },
        },
      });

      checkIfExistsAndAccess(ctx, list, 'MOVIE');

      return await ctx.prisma.$transaction(async (prisma) => {
        await prisma.list.update({
          where: { id: input.listId },
          data: { updatedAt: new Date() },
        });

        if (!list.collections[0]?.movies.length)
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'That collection does not exist.',
          });

        if (input.checked) {
          return ctx.prisma.checkedMovie.createMany({
            data: list.collections[0].movies.map((movie) => ({
              listId: input.listId,
              movieId: movie.id,
            })),
          });
        } else {
          return ctx.prisma.checkedMovie.deleteMany({
            where: {
              listId: input.listId,
              movieId: {
                in: list.collections[0].movies.map((movie) => movie.id),
              },
            },
          });
        }
      });
    }),
  createMovie: protectedProcedure
    .input(zNewMovieSchema)
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.listId },
        select: {
          _count: { select: { movies: { where: { id: input.externalId } } } },
          ownerId: true,
          collaborators: { select: { id: true } },
          type: true,
        },
      });

      checkIfExistsAndAccess(ctx, list, 'MOVIE');

      if (list._count.movies) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'That movie is already in this list.',
        });
      }

      let movie = await ctx.prisma.movie.findUnique({
        where: { id: input.externalId },
      });

      if (!movie) {
        const tmdbMovie = await getMovie(input.externalId);

        movie = await ctx.prisma.movie.create({
          data: {
            ...transformAPIMovie(tmdbMovie.result, tmdbMovie.eTag),
          },
        });
      }

      await checkAndUpdateMovie(ctx, movie);

      return ctx.prisma.list.update({
        where: { id: input.listId },
        data: {
          movies: { connect: { id: movie.id } },
          updatedAt: new Date(),
        },
      });
    }),
  createCollection: protectedProcedure
    .input(zNewMovieSchema)
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.listId },
        select: {
          _count: {
            select: { collections: { where: { id: input.externalId } } },
          },
          ownerId: true,
          collaborators: { select: { id: true } },
          type: true,
        },
      });

      checkIfExistsAndAccess(ctx, list, 'MOVIE');

      if (list._count.collections) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'That collection is already in this list.',
        });
      }

      let collection: Collection | null | undefined =
        await ctx.prisma.collection.findUnique({
          where: { id: input.externalId },
          include: { movies: { select: { id: true } } },
        });

      if (!collection) {
        collection = await checkAndUpdateCollection(ctx, {
          id: input.externalId,
          updatedAt: new Date('01-01-2000'),
          etag: '',
        });
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
          updatedAt: new Date(),
        },
      });
    }),
  deleteMovie: protectedProcedure
    .input(z.object({ id: z.number(), listId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.listId },
        select: {
          ownerId: true,
          type: true,
          collaborators: { select: { id: true } },
        },
      });

      checkIfExistsAndAccess(ctx, list, 'MOVIE');

      const [updatedList] = await ctx.prisma.$transaction([
        ctx.prisma.list.update({
          where: { id: input.listId },
          data: {
            movies: { disconnect: { id: input.id } },
            updatedAt: new Date(),
          },
        }),
        ctx.prisma.checkedMovie.deleteMany({
          where: {
            AND: [{ movieId: input.id }, { listId: input.listId }],
          },
        }),
      ]);

      return updatedList;
    }),
  deleteCollection: protectedProcedure
    .input(z.object({ id: z.number(), listId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.listId },
        select: {
          ownerId: true,
          type: true,
          collaborators: { select: { id: true } },
          collections: {
            select: { movies: { select: { id: true } } },
            where: { id: input.id },
          },
        },
      });

      checkIfExistsAndAccess(ctx, list, 'MOVIE');

      if (!list.collections[0])
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            "The collection you're requesting to delete cannot be found.",
        });

      const [updatedList] = await ctx.prisma.$transaction([
        ctx.prisma.list.update({
          where: { id: input.listId },
          data: {
            collections: { disconnect: { id: input.id } },
            updatedAt: new Date(),
          },
        }),
        ctx.prisma.checkedMovie.deleteMany({
          where: {
            AND: [
              { movieId: { in: list.collections[0].movies.map((m) => m.id) } },
              { listId: input.listId },
            ],
          },
        }),
      ]);

      return updatedList;
    }),
});
