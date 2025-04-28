import { bucketListRouter } from './routers/bucketList/bucketListRouter';
import { inviteRouter } from './routers/invite/inviteRouter';
import { listsRouter } from './routers/lists/listsRouter';
import { movieListRouter } from './routers/movieList/movieListRouter';
import { showListRouter } from './routers/showList/showListRouter';
import { searchRouter } from './routers/search/searchRouter';
import { watchedRouter } from './routers/watched/watchedRouter';
import { revalidationRouter } from './routers/revalidation/revalidationRouter';
import { createCallerFactory, createTRPCRouter } from './trpc';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  lists: listsRouter,
  invite: inviteRouter,
  movieList: movieListRouter,
  showList: showListRouter,
  bucketList: bucketListRouter,
  search: searchRouter,
  watched: watchedRouter,
  revalidation: revalidationRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
