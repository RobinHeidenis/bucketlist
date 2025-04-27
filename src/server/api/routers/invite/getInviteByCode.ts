import { z } from 'zod';
import { TRPCError } from '@trpc/server';
import { clerkClient } from '@clerk/nextjs/server';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

const zGetInviteByCodeSchema = z.object({ code: z.string() });
type GetInviteByCodeInput = z.infer<typeof zGetInviteByCodeSchema>;
export const getInviteByCode = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: GetInviteByCodeInput;
}) => {
  const invite = await ctx.prisma.inviteLink.findUnique({
    where: { code: input.code },
    include: {
      list: {
        include: {
          owner: { select: { id: true } },
          collaborators: { select: { id: true } },
        },
      },
    },
  });

  if (!invite)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: "The invite you're trying to get cannot be found.",
    });

  if (invite.expiresAt < new Date())
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: 'This invite has expired.',
    });

  if (invite.list.ownerId === ctx.auth.userId)
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: "You can't join your own list.",
    });

  if (invite.list.collaborators.some((c) => c.id === ctx.auth.userId))
    throw new TRPCError({
      code: 'PRECONDITION_FAILED',
      message: 'You are already a collaborator on this list.',
    });

  const client = await clerkClient();
  const { firstName, lastName, externalAccounts } =
    await client.users.getUser(invite.list.owner.id);

  return {
    ...invite,
    list: {
      ...invite.list,
      owner: {
        ...invite.list.owner,
        name:
          (`${firstName ?? ''} ${lastName ?? ''}`.trim() ||
            externalAccounts[0]?.firstName) ??
          "User that somehow doesn't have a name or a connected account",
      },
    },
  };
};

export const getInviteByCodeProcedure = protectedProcedure
  .input(zGetInviteByCodeSchema)
  .query(getInviteByCode);
