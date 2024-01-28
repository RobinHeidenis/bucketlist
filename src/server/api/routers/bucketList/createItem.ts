import { type z } from 'zod';
import { zNewListItemSchema } from '~/schemas/listSchemas';
import { checkIfExistsAndAccess } from '~/server/utils/checkIfExistsAndAccess';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

export const createItem = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zNewListItemSchema>;
}) => {
  const list = await ctx.prisma.list.findUnique({
    where: { id: input.listId },
    select: {
      ownerId: true,
      collaborators: { select: { id: true } },
      type: true,
    },
  });

  checkIfExistsAndAccess(ctx, list, 'BUCKET');

  const [createdItem] = await ctx.prisma.$transaction([
    ctx.prisma.bucketListItem.create({
      data: {
        title: input.title,
        description: input.description,
        list: { connect: { id: input.listId } },
      },
    }),
    ctx.prisma.list.update({
      where: { id: input.listId },
      data: { updatedAt: new Date() },
    }),
  ]);

  return createdItem;
};

export const createItemProcedure = protectedProcedure
  .input(zNewListItemSchema)
  .mutation(createItem);
