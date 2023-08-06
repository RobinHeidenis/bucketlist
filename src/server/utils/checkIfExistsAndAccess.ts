import type { createTRPCContext } from '~/server/api/trpc';
import type { List, ListType, User } from '@prisma/client';
import { TRPCError } from '@trpc/server';

export const checkAccess = (
  ctx: Awaited<ReturnType<typeof createTRPCContext>>,
  list: Partial<List & { collaborators: Pick<User, 'id'>[] }>,
) =>
  list.ownerId === ctx.auth.userId ||
  list.collaborators?.some((c) => c.id === ctx.auth.userId);

type assertFunction = (
  ctx: Awaited<ReturnType<typeof createTRPCContext>>,
  list:
    | (Partial<List & { collaborators: Pick<User, 'id'>[] }> & {
        type: ListType;
      })
    | undefined
    | null,
  expectedListType: ListType,
) => asserts list is Partial<List & { collaborators: Pick<User, 'id'>[] }> & {
  type: ListType;
};
export const checkIfExistsAndAccess: assertFunction = (
  ctx,
  list,
  expectedListType,
) => {
  if (!list)
    throw new TRPCError({
      code: 'NOT_FOUND',
      message: 'That list cannot be found.',
    });

  if (expectedListType !== list.type)
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: `You can only add ${expectedListType.toLowerCase()}s to this list.`,
    });

  if (!checkAccess(ctx, list))
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'You are not allowed to update this list.',
    });
};
