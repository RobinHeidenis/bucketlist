import { type z } from 'zod';
import { zIdSchema } from '~/schemas/listSchemas';
import { TRPCError } from '@trpc/server';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

export const leaveList = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zIdSchema>;
}) => {
  const requestedList = await ctx.prisma.list.findUnique({
    where: { id: input.id },
    select: {
      ownerId: true,
      collaborators: {
        select: {
          id: true,
        },
      },
    },
  });

  if (!requestedList)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: "The list you're requesting to leave cannot be found.",
    });

  if (requestedList.ownerId === ctx.auth.userId)
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You cannot leave a list you own.',
    });

  if (!requestedList.collaborators.find((c) => c.id === ctx.auth.userId))
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You are not a collaborator on this list.',
    });

  return ctx.prisma.list.update({
    where: { id: input.id },
    data: {
      collaborators: {
        disconnect: {
          id: ctx.auth.userId,
        },
      },
    },
  });
};

export const leaveListProcedure = protectedProcedure
  .input(zIdSchema)
  .mutation(leaveList);
