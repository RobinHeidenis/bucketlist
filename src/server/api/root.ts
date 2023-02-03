import { authRouter } from './routers/auth';
import { listsRouter } from './routers/lists';
import { createTRPCRouter } from './trpc';
import { listItemRouter } from './routers/listItem';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  lists: listsRouter,
  listItem: listItemRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
