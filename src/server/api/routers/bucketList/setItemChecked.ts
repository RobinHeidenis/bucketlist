import { z } from 'zod';
import { checkIfExistsAndAccess } from '~/server/utils/checkIfExistsAndAccess';
import { TRPCError } from '@trpc/server';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

const zSetItemCheckedSchema = z.object({
  id: z.string().uuid(),
  listId: z.string().uuid(),
  checked: z.boolean(),
});

export const setItemChecked = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zSetItemCheckedSchema>;
}) => {
  const list = await ctx.prisma.list.findUnique({
    where: { id: input.listId },
    select: {
      ownerId: true,
      type: true,
      collaborators: { select: { id: true } },
      bucketListItems: { select: { id: true }, where: { id: input.id } },
    },
  });

  checkIfExistsAndAccess(ctx, list, 'BUCKET');

  if (!list.bucketListItems.length)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: "The item you're requesting to update cannot be found.",
    });

  await ctx.prisma.$transaction([
    ctx.prisma.bucketListItem.update({
      where: { id: input.id },
      data: { checked: input.checked },
    }),
    ctx.prisma.list.update({
      where: { id: input.listId },
      data: { updatedAt: new Date() },
    }),
  ]);
};

export const setItemCheckedProcedure = protectedProcedure
  .input(zSetItemCheckedSchema)
  .mutation(setItemChecked);
