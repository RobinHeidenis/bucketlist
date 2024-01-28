import type { z } from 'zod';
import { zListIdSchema } from '~/schemas/listSchemas';
import { TRPCError } from '@trpc/server';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

export const createInvite = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zListIdSchema>;
}) => {
  const list = await ctx.prisma.list.findUnique({
    where: { id: input.listId },
    select: { ownerId: true },
  });

  if (!list)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message:
        "The list you're trying to create an invite for cannot be found.",
    });

  if (list.ownerId !== ctx.auth.userId)
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You are not allowed to create an invite for this list.',
    });

  return ctx.prisma.inviteLink.create({
    data: {
      list: { connect: { id: input.listId } },
      code: Math.random().toString(36).substring(2, 7),
      expiresAt: new Date(Date.now() + 1000 * 60 * 60),
    },
  });
};

export const createInviteProcedure = protectedProcedure
  .input(zListIdSchema)
  .mutation(createInvite);
