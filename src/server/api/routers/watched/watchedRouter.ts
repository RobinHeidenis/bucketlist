import { createTRPCRouter } from '~/server/api/trpc';
import { markItemAsWatchedProcedure } from './markItemAsWatched';
import { getAllWatchInstancesProcedure } from './getAllWatchInstances';
import { deleteWatchInstanceProcedure } from './deleteWatchInstance';
import { deleteAllWatchInstancesProcedure } from './deleteAllWatchInstances';

export const watchedRouter = createTRPCRouter({
  markItemAsWatched: markItemAsWatchedProcedure,
  getAllWatchInstances: getAllWatchInstancesProcedure,
  deleteWatchInstance: deleteWatchInstanceProcedure,
  deleteAllWatchInstances: deleteAllWatchInstancesProcedure,
});
