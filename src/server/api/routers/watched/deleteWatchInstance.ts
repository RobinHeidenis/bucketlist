import { z } from 'zod';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

const zDeleteWatchInstanceSchema = z.object({
  id: z.string(),
  type: z.enum(['movie', 'episode']),
});

export const deleteWatchInstance = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zDeleteWatchInstanceSchema>;
}) => {
  if (input.type === 'movie') {
    return ctx.prisma.watchedMovie.delete({
      where: {
        id: input.id,
      },
    });
  }

  return ctx.prisma.watchedEpisode.delete({
    where: {
      id: input.id,
    },
  });
};

export const deleteWatchInstanceProcedure = protectedProcedure
  .input(zDeleteWatchInstanceSchema)
  .mutation(deleteWatchInstance);
