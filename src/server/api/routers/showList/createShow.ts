import { z } from 'zod';
import { checkIfExistsAndAccess } from '~/server/utils/checkIfExistsAndAccess';
import { TRPCError } from '@trpc/server';
import { getAndUpdateOrCreateShow } from './utils/getAndUpdateOrCreateShow';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

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

  const show = await ctx.prisma.show.findUnique({
    where: { id: input.showId },
    select: { id: true, updatedAt: true },
  });

  if (!show || show.updatedAt < new Date(Date.now() - 1000 * 60 * 60 * 24)) {
    await getAndUpdateOrCreateShow(ctx.prisma, input.showId);
  }

  return ctx.prisma.list.update({
    where: { id: input.listId },
    data: {
      shows: {
        connect: { id: input.showId },
      },
      updatedAt: new Date(),
    },
  });
};

export const createShowProcedure = protectedProcedure
  .input(zCreateShowSchema)
  .mutation(createShow);
