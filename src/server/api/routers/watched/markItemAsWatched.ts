import { z } from 'zod';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

const zMarkItemAsWatchedSchema = z.object({
  id: z.number(),
  type: z.enum(['movie', 'episode']),
  watchedAt: z.date().optional(),
});

export const markItemAsWatched = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zMarkItemAsWatchedSchema>;
}) => {
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
};

export const markItemAsWatchedProcedure = protectedProcedure
  .input(zMarkItemAsWatchedSchema)
  .mutation(markItemAsWatched);
