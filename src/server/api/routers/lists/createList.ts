import { type z } from 'zod';
import { zNewListSchema } from '~/schemas/listSchemas';
import { type AuthedTRPCContext, protectedProcedure } from '~/server/api/trpc';

export const createList = async ({
  ctx,
  input,
}: {
  ctx: AuthedTRPCContext;
  input: z.infer<typeof zNewListSchema>;
}) => {
  return ctx.prisma.list.create({
    data: {
      title: input.title,
      description: input.description,
      ownerId: ctx.auth.userId,
      type: input.type,
    },
  });
};

export const createListProcedure = protectedProcedure
  .input(zNewListSchema)
  .mutation(createList);
