import type { z } from 'zod';
import { zIdSchema } from '~/schemas/listSchemas';
import { env } from '~/env.mjs';
import { getBaseUrl } from '~/utils/api';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

export const getInvitesByListId = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zIdSchema>;
}) => {
  const invites = await ctx.prisma.inviteLink.findMany({
    where: { listId: input.id },
  });

  return invites.map((i) => ({
    ...i,
    url: `${env.BASE_URL ?? getBaseUrl()}/invite/${i.code}`,
  }));
};

export const getInvitesByListIdProcedure = protectedProcedure
  .input(zIdSchema)
  .query(getInvitesByListId);
