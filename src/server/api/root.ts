import { authRouter } from './routers/auth';
import { exampleRouter } from './routers/example';
import { listsRouter } from './routers/lists';
import { createTRPCRouter } from './trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  auth: authRouter,
  lists: listsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;