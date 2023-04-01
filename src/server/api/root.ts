import { authRouter } from './routers/auth';
import { listsRouter } from './routers/lists';
import { createTRPCRouter } from './trpc';
import { inviteRouter } from './routers/invite';
import { movieRouter } from './routers/movie';
import { movieListRouter } from './routers/movieList';
import { bucketListRouter } from './routers/bucketList';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  lists: listsRouter,
  invite: inviteRouter,
  movies: movieRouter,
  movieList: movieListRouter,
  bucketList: bucketListRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
