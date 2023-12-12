import {
    authRouter,
    bucketListRouter,
    inviteRouter,
    listsRouter,
    movieListRouter,
    searchRouter,
    showListRouter,
} from './routers';
import {createTRPCRouter} from './trpc';
import {watchedRouter} from '~/server/api/routers/watched';

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  auth: authRouter,
  lists: listsRouter,
  invite: inviteRouter,
  movieList: movieListRouter,
  showList: showListRouter,
  bucketList: bucketListRouter,
  search: searchRouter,
  watched: watchedRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
