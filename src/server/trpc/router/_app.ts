import { router } from '../trpc';
import { authRouter } from './auth';
import { exampleRouter } from './example';
import { listsRouter } from './lists';

export const appRouter = router({
  example: exampleRouter,
  auth: authRouter,
  lists: listsRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
