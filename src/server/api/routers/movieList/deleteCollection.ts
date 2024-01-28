import { z } from 'zod';
import { checkIfExistsAndAccess } from '~/server/utils/checkIfExistsAndAccess';
import { TRPCError } from '@trpc/server';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

const zDeleteCollectionSchema = z.object({
  id: z.number(),
  listId: z.string(),
});

export const deleteCollection = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zDeleteCollectionSchema>;
}) => {
  const list = await ctx.prisma.list.findUnique({
    where: { id: input.listId },
    select: {
      ownerId: true,
      type: true,
      collaborators: { select: { id: true } },
      collections: {
        select: { movies: { select: { id: true } } },
        where: { id: input.id },
      },
    },
  });

  checkIfExistsAndAccess(ctx, list, 'MOVIE');

  if (!list.collections[0])
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: "The collection you're requesting to delete cannot be found.",
    });

  const [updatedList] = await ctx.prisma.$transaction([
    ctx.prisma.list.update({
      where: { id: input.listId },
      data: {
        collections: { disconnect: { id: input.id } },
        updatedAt: new Date(),
      },
    }),
    ctx.prisma.checkedMovie.deleteMany({
      where: {
        AND: [
          { movieId: { in: list.collections[0].movies.map((m) => m.id) } },
          { listId: input.listId },
        ],
      },
    }),
  ]);

  return updatedList;
};

export const deleteCollectionProcedure = protectedProcedure
  .input(zDeleteCollectionSchema)
  .mutation(deleteCollection);
