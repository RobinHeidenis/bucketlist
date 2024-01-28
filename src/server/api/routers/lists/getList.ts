import { TRPCError } from '@trpc/server';
import { getBucketList } from './utils/getBucketList';
import {
  formatMovieList,
  getMovieList,
} from '~/server/api/routers/lists/utils/movieList';
import {
  formatShowList,
  getShowList,
} from '~/server/api/routers/lists/utils/showList';
import { clerkClient } from '@clerk/nextjs';
import { getListBase } from '~/server/api/routers/lists/utils/getListBase';
import {
  type BucketList,
  isBucketList,
  isMovieList,
  isShowList,
  type MovieList,
  type ShowList,
} from '~/types/List';
import { type z } from 'zod';
import { zIdSchema } from '~/schemas/listSchemas';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

export const getList = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zIdSchema>;
}): Promise<BucketList | MovieList | ShowList | undefined> => {
  if (ctx.req.headers['if-modified-since']) {
    const list = await ctx.prisma.list.findUnique({
      where: { id: input.id },
      select: { updatedAt: true },
    });

    if (!list)
      throw new TRPCError({
        code: 'NOT_FOUND',
        message: "The list you're requesting cannot be found.",
      });

    if (ctx.req.headers['if-modified-since'] === list.updatedAt.toISOString()) {
      ctx.res.setHeader('Last-Modified', list.updatedAt.toISOString());
      ctx.res.statusCode = 304;
      return;
    }
  }

  const listType = await ctx.prisma.list.findUnique({
    where: { id: input.id },
    select: { type: true },
  });

  if (!listType)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: "The list you're requesting cannot be found.",
    });

  let list;

  if (listType.type === 'BUCKET')
    list = await getBucketList(ctx.prisma, input.id);
  else if (listType.type === 'MOVIE')
    list = await getMovieList(ctx.prisma, input.id);
  else list = await getShowList(ctx.prisma, input.id);

  if (!list)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: "The list you're requesting cannot be found.",
    });

  if (
    list.ownerId !== ctx.auth.userId &&
    !list.isPublic &&
    !list.collaborators.find(
      (collaborator) => collaborator.id === ctx.auth.userId,
    )
  )
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You do not have access to view this list.',
    });

  const clerkOwner = await clerkClient.users
    .getUser(list.ownerId)
    .catch(() => ({
      firstName: null,
      lastName: null,
      externalAccounts: [],
    }));

  const base = getListBase(list, clerkOwner);

  ctx.res.setHeader('Last-Modified', list.updatedAt.toISOString());

  if (isBucketList(list)) {
    return {
      ...base,
      bucketListItems: list.bucketListItems,
      updatedAt: list.updatedAt,
      total: list.bucketListItems.length,
      totalChecked: list.bucketListItems.filter((item) => item.checked).length,
    };
  }

  if (isMovieList(list)) return formatMovieList(list, base);

  if (isShowList(list)) return formatShowList(list, base);

  // If the list is somehow not one of the three types, throw an error.
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: 'Something went wrong.',
  });
};

export const getListProcedure = protectedProcedure
  .input(zIdSchema)
  .query(getList);
