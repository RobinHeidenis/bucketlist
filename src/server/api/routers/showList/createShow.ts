import { z } from 'zod';
import { checkIfExistsAndAccess } from '~/server/utils/checkIfExistsAndAccess';
import { TRPCError } from '@trpc/server';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';
import { createTmdbService } from '~/server/TMDB/tmdbService';

const zCreateShowSchema = z.object({
  showId: z.number(),
  listId: z.string().uuid(),
});

export const createShow = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zCreateShowSchema>;
}) => {
  const list = await ctx.prisma.list.findUnique({
    where: { id: input.listId },
    select: {
      _count: { select: { shows: { where: { id: input.showId } } } },
      ownerId: true,
      collaborators: { select: { id: true } },
      type: true,
    },
  });

  checkIfExistsAndAccess(ctx, list, 'SHOW');

  if (list._count.shows) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'This show is already on this list.',
    });
  }

  const tmdbService = createTmdbService(ctx.prisma);
  const show = await tmdbService.findOrCreateShow(input.showId);

  return ctx.prisma.list.update({
    where: { id: input.listId },
    data: {
      shows: {
        connect: { id: show.id },
      },
      updatedAt: new Date(),
    },
  });
};

export const createShowProcedure = protectedProcedure
  .input(zCreateShowSchema)
  .mutation(createShow);
