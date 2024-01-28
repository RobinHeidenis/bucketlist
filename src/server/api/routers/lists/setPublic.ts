import { type z } from 'zod';
import { zSetIsPublicSchema } from '~/schemas/listSchemas';
import { TRPCError } from '@trpc/server';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

export const setPublic = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zSetIsPublicSchema>;
}) => {
  const requestedList = await ctx.prisma.list.findUnique({
    where: { id: input.id },
    select: { ownerId: true },
  });

  if (!requestedList)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: "The list you're requesting to update cannot be found.",
    });

  if (requestedList.ownerId !== ctx.auth.userId)
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You do not have access to update this list.',
    });

  return ctx.prisma.list.update({
    where: { id: input.id },
    data: {
      isPublic: input.isPublic,
    },
  });
};

export const setPublicProcedure = protectedProcedure
  .input(zSetIsPublicSchema)
  .mutation(setPublic);
