import { zNewMovieSchema } from '~/schemas/listSchemas';
import type { z } from 'zod';
import { checkIfExistsAndAccess } from '~/server/utils/checkIfExistsAndAccess';
import { TRPCError } from '@trpc/server';
import type { Collection } from '@prisma/client';
import { checkAndUpdateCollection } from '~/server/tmdbApi';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

export const createCollection = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zNewMovieSchema>;
}) => {
  const list = await ctx.prisma.list.findUnique({
    where: { id: input.listId },
    select: {
      _count: {
        select: { collections: { where: { id: input.externalId } } },
      },
      ownerId: true,
      collaborators: { select: { id: true } },
      type: true,
    },
  });

  checkIfExistsAndAccess(ctx, list, 'MOVIE');

  if (list._count.collections) {
    throw new TRPCError({
      code: 'CONFLICT',
      message: 'That collection is already in this list.',
    });
  }

  let collection: Collection | null | undefined =
    await ctx.prisma.collection.findUnique({
      where: { id: input.externalId },
      include: { movies: { select: { id: true } } },
    });

  if (!collection) {
    collection = await checkAndUpdateCollection(ctx, {
      id: input.externalId,
      updatedAt: new Date('01-01-2000'),
      etag: '',
    });
  }

  if (!collection)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'Something went wrong finding that collection on TMDB.',
    });

  await checkAndUpdateCollection(ctx, collection);

  return ctx.prisma.list.update({
    where: { id: input.listId },
    data: {
      collections: { connect: { id: collection.id } },
      updatedAt: new Date(),
    },
  });
};

export const createCollectionProcedure = protectedProcedure
  .input(zNewMovieSchema)
  .mutation(createCollection);
