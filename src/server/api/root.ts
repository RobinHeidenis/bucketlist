import { authRouter } from './routers/auth';
import { listsRouter } from './routers/lists';
import { createTRPCRouter } from './trpc';
import { inviteRouter } from './routers/invite';
import { movieRouter } from './routers/movie';
import { movieListRouter } from './routers/movieList';
import { bucketListRouter } from './routers/bucketList';
import { showListRouter } from '~/server/api/routers/showList';
import { showRouter } from '~/server/api/routers/show';

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
  shows: showRouter,
  showList: showListRouter,
  bucketList: bucketListRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
