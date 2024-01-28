import { zIdSchema } from '~/schemas/listSchemas';
import { type z } from 'zod';
import { TRPCError } from '@trpc/server';
import { checkIfExistsAndAccess } from '~/server/utils/checkIfExistsAndAccess';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

export const deleteItem = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zIdSchema>;
}) => {
  const listItem = await ctx.prisma.bucketListItem.findUnique({
    where: { id: input.id },
    select: {
      list: {
        select: {
          ownerId: true,
          type: true,
          collaborators: { select: { id: true } },
          id: true,
        },
      },
    },
  });

  if (!listItem)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: "The item you're requesting to delete cannot be found.",
    });

  checkIfExistsAndAccess(ctx, listItem.list, 'BUCKET');

  const [deletedItem] = await ctx.prisma.$transaction([
    ctx.prisma.bucketListItem.delete({
      where: { id: input.id },
    }),
    ctx.prisma.list.update({
      where: { id: listItem.list.id },
      data: { updatedAt: new Date() },
    }),
  ]);

  return deletedItem;
};

export const deleteItemProcedure = protectedProcedure
  .input(zIdSchema)
  .mutation(deleteItem);
