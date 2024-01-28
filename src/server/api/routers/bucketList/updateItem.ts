import type { z } from 'zod';
import { zEditListItemSchema } from '~/schemas/listSchemas';
import { TRPCError } from '@trpc/server';
import { checkIfExistsAndAccess } from '~/server/utils/checkIfExistsAndAccess';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

export const updateItem = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zEditListItemSchema>;
}) => {
  const listItem = await ctx.prisma.bucketListItem.findUnique({
    where: { id: input.id },
    select: {
      list: {
        select: {
          ownerId: true,
          type: true,
          collaborators: { select: { id: true } },
        },
      },
    },
  });

  if (!listItem)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: "The item you're requesting to update cannot be found.",
    });

  checkIfExistsAndAccess(ctx, listItem.list, 'BUCKET');

  const [updatedItem] = await ctx.prisma.$transaction([
    ctx.prisma.bucketListItem.update({
      where: { id: input.id },
      data: {
        title: input.title,
        description: input.description,
      },
    }),
    ctx.prisma.list.update({
      where: { id: input.listId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return updatedItem;
};

export const updateItemProcedure = protectedProcedure
  .input(zEditListItemSchema)
  .mutation(updateItem);
