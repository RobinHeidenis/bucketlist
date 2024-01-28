import type { z } from 'zod';
import { zIdSchema } from '~/schemas/listSchemas';
import { TRPCError } from '@trpc/server';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

export const deleteInvite = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zIdSchema>;
}) => {
  const list = await ctx.prisma.inviteLink.findUnique({
    where: { id: input.id },
    select: { list: { select: { ownerId: true } } },
  });

  if (!list)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: "The invite you're trying to delete cannot be found.",
    });

  if (list.list.ownerId !== ctx.auth.userId)
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You are not allowed to delete this invite.',
    });

  return ctx.prisma.inviteLink.delete({
    where: { id: input.id },
  });
};

export const deleteInviteProcedure = protectedProcedure
  .input(zIdSchema)
  .mutation(deleteInvite);
