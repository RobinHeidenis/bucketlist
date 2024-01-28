import type { z } from 'zod';
import { zIdSchema } from '~/schemas/listSchemas';
import { TRPCError } from '@trpc/server';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

export const joinList = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zIdSchema>;
}) => {
  const invite = await ctx.prisma.inviteLink.findUnique({
    where: { id: input.id },
    include: {
      list: { include: { collaborators: { select: { id: true } } } },
    },
  });

  if (!invite)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: "The item you're requesting to delete cannot be found.",
    });

  if (invite.expiresAt < new Date())
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: 'This invite has expired.',
    });

  if (invite.list.ownerId === ctx.auth.userId)
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: 'You are the owner of this list.',
    });

  if (invite.list.collaborators.some((c) => c.id === ctx.auth.userId))
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: 'You are already a collaborator on this list.',
    });

  return await ctx.prisma.list.update({
    where: { id: invite.listId },
    data: {
      collaborators: {
        connect: { id: ctx.auth.userId },
      },
    },
  });
};

export const joinListProcedure = protectedProcedure
  .input(zIdSchema)
  .mutation(joinList);
