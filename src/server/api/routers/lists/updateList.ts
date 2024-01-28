import { type z } from 'zod';
import { TRPCError } from '@trpc/server';
import { zEditListSchema } from '~/schemas/listSchemas';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

export const updateList = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zEditListSchema>;
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
      title: input.title,
      description: input.description,
    },
  });
};

export const updateListProcedure = protectedProcedure
  .input(zEditListSchema)
  .mutation(updateList);
