import type { createTRPCContext } from '../trpc';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { zIdSchema, zNewMovieSchema } from '../../../schemas/listSchemas';
import { TRPCError } from '@trpc/server';
import type { List, Movie, User } from '@prisma/client';
import { env } from '../../../env/server.mjs';
import type { TMDBMovie } from '../../../types/TMDBMovie';

const checkAccess = (
  ctx: Awaited<ReturnType<typeof createTRPCContext>>,
  list: Partial<List & { collaborators: User[] }>,
) =>
  list.ownerId === ctx.session?.user?.id ||
  list.collaborators?.some((c) => c.id === ctx.session?.user?.id);

const createDBMovieFromTMDBMovie = (
  movie: TMDBMovie,
): Omit<Movie, 'updatedAt'> => ({
  id: movie.id.toString(),
  title: movie.title,
  posterUrl: movie.poster_path,
  description: movie.overview,
  genres: movie.genres.map((g) => g.name).join(', '),
  runtime: movie.runtime,
  rating: movie.vote_average,
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

const getTMDBMovie = async (id: string): Promise<TMDBMovie | null> => {
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

export const movieRouter = createTRPCRouter({
  setMovieWatched: protectedProcedure
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
        select: { ownerId: true, collaborators: true, type: true },
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

      if (list.type !== 'MOVIE')
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: 'You can only check movies using this endpoint.',
        });

      return ctx.prisma.movieListItem.update({
        where: { id: input.id },
        data: { checked: input.checked },
      });
    }),
  createMovie: protectedProcedure
    .input(zNewMovieSchema)
    .mutation(async ({ ctx, input }) => {
      const list = await ctx.prisma.list.findUnique({
        where: { id: input.listId },
        select: { ownerId: true, collaborators: true },
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

      return ctx.prisma.movieListItem.create({
        data: {
          list: { connect: { id: input.listId } },
          movie: { connect: { id: movie.id } },
        },
      });
    }),
  deleteMovie: protectedProcedure
    .input(zIdSchema)
    .mutation(async ({ ctx, input }) => {
      const listItem = await ctx.prisma.movieListItem.findUnique({
        where: { id: input.id },
        select: { list: { select: { ownerId: true, collaborators: true } } },
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

      return ctx.prisma.movieListItem.delete({
        where: { id: input.id },
      });
    }),
});
