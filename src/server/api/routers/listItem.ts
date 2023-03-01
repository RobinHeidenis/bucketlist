import type { createTRPCContext } from '../trpc';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import {
  zEditListItemSchema,
  zIdSchema,
  zNewListItemSchema,
  zNewMovieSchema,
} from '../../../schemas/listSchemas';
import { TRPCError } from '@trpc/server';
import type { List, Movie, User } from '@prisma/client';
import type { TMDBMovie } from '../../../types/TMDBMovie';
import { TMDBCollection } from '../../../types/TMDBMovie';
import { env } from '../../../env/server.mjs';

const checkAccess = (
  ctx: Awaited<ReturnType<typeof createTRPCContext>>,
  list: Partial<List & { collaborators: Pick<User, 'id'>[] }>,
) =>
  list.ownerId === ctx.session?.user?.id ||
  list.collaborators?.some((c) => c.id === ctx.session?.user?.id);

const createDBMovieFromTMDBMovie = (
  movie: TMDBMovie,
): Omit<Movie, 'updatedAt'> => ({
  id: movie.id,
  title: movie.title,
  posterUrl: movie.poster_path,
  description: movie.overview,
  genres: movie.genres.map((g) => g.name).join(', '),
  runtime: movie.runtime,
  releaseDate: movie.release_date,
  rating: movie.vote_average.toFixed(1),
});

const checkAndUpdateMovie = async (
  ctx: Awaited<ReturnType<typeof createTRPCContext>>,
  movie: Pick<Movie, 'id' | 'updatedAt'>,
) => {
  // if movie data is at least 1 day old, update it
  if (movie.updatedAt < new Date(Date.now() - 1000 * 60 * 60 * 24)) {
    const tmdbMovie = await getTMDBMovie(movie.id);
    if (!tmdbMovie)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: 'Something went wrong finding that movie on TMDB.',
      });

    await ctx.prisma.movie.update({
      where: { id: movie.id },
      data: {
        ...createDBMovieFromTMDBMovie(tmdbMovie),
        updatedAt: new Date(),
      },
    });
  }
};

const getTMDBMovie = async (id: number | string): Promise<TMDBMovie | null> => {
  const res = await fetch(
    `https://api.themoviedb.org/3/movie/${id}&language=en-US`,
    {
      headers: {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        Authorization: `Bearer ${env.TMDB_API_KEY ?? ''}`,
      },
    },
  );

  if (!res.ok) {
    return null;
  }

  return (await res.json()) as TMDBMovie;
};

const getTMDBCollection = async (
  id: number | string,
): Promise<z.infer<typeof TMDBCollection>> => {
  const res = await fetch(
    `https://api.themoviedb.org/3/collection/${id}?language=en-US`,
    {
      headers: {
        // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
        Authorization: `Bearer ${env.TMDB_API_KEY ?? ''}`,
      },
    },
  );

  if (!res.ok) {
    throw new Error('TMDB_FETCH_ERROR');
  }

  return TMDBCollection.parse(await res.json());
};

export const listItemRouter = createTRPCRouter({
  setItemChecked: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        listId: z.string().uuid(),
        checked: z.boolean(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.listId },
        select: { ownerId: true, collaborators: { select: { id: true } } },
      });

      if (!list)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            "The list you're trying to update an item on cannot be found.",
        });

      if (!checkAccess(ctx, list))
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not allowed to update this item.',
        });

      return ctx.prisma.listItem.update({
        where: { id: input.id },
        data: { checked: input.checked },
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
        select: { ownerId: true, collaborators: { select: { id: true } } },
      });

      if (!list)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            "The list you're trying to update an item on cannot be found.",
        });

      if (!checkAccess(ctx, list))
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not allowed to update this item.',
        });

      return ctx.prisma.listItem.updateMany({
        where: { collectionId: input.id },
        data: { checked: input.checked },
      });
    }),
  createItem: protectedProcedure
    .input(zNewListItemSchema)
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.listId },
        select: {
          ownerId: true,
          collaborators: { select: { id: true } },
          type: true,
        },
      });

      if (!list)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The list you're trying to add an item to cannot be found.",
        });

      if (!checkAccess(ctx, list))
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not allowed to add items to this list.',
        });

      if (list.type !== 'BUCKET')
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You can only add bucket list items to this list.',
        });

      return ctx.prisma.listItem.create({
        data: {
          title: input.title,
          description: input.description,
          list: { connect: { id: input.listId } },
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

      if (!list)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The list you're trying to add an item to cannot be found.",
        });

      if (!checkAccess(ctx, list))
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not allowed to add items to this list.',
        });

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
            ...createDBMovieFromTMDBMovie(tmdbMovie),
          },
        });
      }

      await checkAndUpdateMovie(ctx, movie);

      return ctx.prisma.listItem.create({
        data: {
          list: { connect: { id: input.listId } },
          movie: { connect: { id: movie.id } },
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

      if (!list)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The list you're trying to add an item to cannot be found.",
        });

      if (!checkAccess(ctx, list))
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not allowed to add items to this list.',
        });

      if (list.type !== 'MOVIE')
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You can only add movie list items to this list.',
        });

      let collection = await ctx.prisma.collection.findUnique({
        where: { id: input.externalId },
        include: { movies: { select: { id: true } } },
      });

      if (!collection) {
        let tmdbCollection;
        try {
          tmdbCollection = await getTMDBCollection(input.externalId);
        } catch (e) {
          console.log(e);
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Something went wrong finding that collection on TMDB.',
          });
        }

        if (!tmdbCollection)
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Something went wrong finding that collection on TMDB.',
          });

        const movies = await Promise.all(
          tmdbCollection.parts.map(async (part) => {
            let movie = await ctx.prisma.movie.findUnique({
              where: { id: part.id },
            });

            if (!movie) {
              const tmdbMovie = await getTMDBMovie(part.id);
              if (!tmdbMovie)
                throw new TRPCError({
                  code: 'NOT_FOUND',
                  message: 'Something went wrong finding that movie on TMDB.',
                });

              movie = await ctx.prisma.movie.create({
                data: {
                  ...createDBMovieFromTMDBMovie(tmdbMovie),
                },
              });
            }

            await checkAndUpdateMovie(ctx, movie);

            return movie;
          }),
        );

        collection = await ctx.prisma.collection.create({
          data: {
            id: tmdbCollection.id,
            name: tmdbCollection.name,
            overview: tmdbCollection.overview,
            posterUrl: tmdbCollection.backdrop_path,
            movies: { connect: movies.map((movie) => ({ id: movie.id })) },
          },
          include: { movies: { select: { id: true } } },
        });
      }

      if (!collection)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Something went wrong finding that collection on TMDB.',
        });

      return await Promise.all(
        collection.movies.map(async (movie) => {
          return await ctx.prisma.listItem.create({
            data: {
              list: { connect: { id: input.listId } },
              collection: { connect: { id: collection?.id } },
              movie: { connect: { id: movie.id } },
            },
          });
        }),
      );
    }),
  deleteItem: protectedProcedure
    .input(zIdSchema)
    .mutation(async ({ ctx, input }) => {
      const listItem = await ctx.prisma.listItem.findUnique({
        where: { id: input.id },
        select: {
          list: {
            select: { ownerId: true, collaborators: { select: { id: true } } },
          },
        },
      });

      if (!listItem)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The item you're requesting to delete cannot be found.",
        });

      if (!checkAccess(ctx, listItem.list))
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not allowed to delete this item',
        });

      return ctx.prisma.listItem.delete({
        where: { id: input.id },
      });
    }),
  deleteCollection: protectedProcedure
    .input(z.object({ id: z.number(), listId: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.listId },
        select: { ownerId: true, collaborators: { select: { id: true } } },
      });

      if (!list)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The list you're requesting to delete cannot be found.",
        });

      if (!checkAccess(ctx, list))
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not allowed to delete this collection',
        });

      return ctx.prisma.listItem.deleteMany({
        where: { collectionId: input.id, listId: input.listId },
      });
    }),
  updateItem: protectedProcedure
    .input(zEditListItemSchema)
    .mutation(async ({ ctx, input }) => {
      const listItem = await ctx.prisma.listItem.findUnique({
        where: { id: input.id },
        select: {
          list: {
            select: { ownerId: true, collaborators: { select: { id: true } } },
          },
        },
      });

      if (!listItem)
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: "The item you're requesting to update cannot be found.",
        });

      if (!checkAccess(ctx, listItem.list))
        throw new TRPCError({
          code: 'UNAUTHORIZED',
          message: 'You are not allowed to update this item',
        });

      return ctx.prisma.listItem.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
        },
      });
    }),
});
