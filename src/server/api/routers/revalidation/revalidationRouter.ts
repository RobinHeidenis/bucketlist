import { createTRPCRouter } from '~/server/api/trpc';
import { revalidateShowProcedure } from './revalidateShow';

export const revalidationRouter = createTRPCRouter({
  revalidateShow: revalidateShowProcedure,
});
