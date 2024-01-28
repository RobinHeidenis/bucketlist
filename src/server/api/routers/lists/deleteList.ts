import { type z } from 'zod';
import { TRPCError } from '@trpc/server';
import { zIdSchema } from '~/schemas/listSchemas';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

export const deleteList = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zIdSchema>;
}) => {
  const requestedList = await ctx.prisma.list.findUnique({
    where: { id: input.id },
    select: { ownerId: true },
  });

  if (!requestedList)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: "The list you're requesting to delete cannot be found.",
    });

  if (requestedList.ownerId !== ctx.auth.userId)
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You do not have access to delete this list.',
    });

  return ctx.prisma.list.delete({ where: { id: input.id } });
};

export const deleteListProcedure = protectedProcedure
  .input(zIdSchema)
  .mutation(deleteList);
