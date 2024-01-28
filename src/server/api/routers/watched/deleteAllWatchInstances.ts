import { z } from 'zod';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

const zDeleteAllWatchInstancesSchema = z.object({
  id: z.number(),
  type: z.enum(['movie', 'episode']),
});

export const deleteAllWatchInstances = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zDeleteAllWatchInstancesSchema>;
}) => {
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
};

export const deleteAllWatchInstancesProcedure = protectedProcedure
  .input(zDeleteAllWatchInstancesSchema)
  .mutation(deleteAllWatchInstances);
