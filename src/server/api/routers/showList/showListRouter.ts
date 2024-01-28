import { createTRPCRouter } from '~/server/api/trpc';
import { setEpisodeWatchedProcedure } from './setEpisodeWatched';
import { setSeasonWatchedProcedure } from './setSeasonWatched';
import { createShowProcedure } from './createShow';
import { deleteShowProcedure } from './deleteShow';

export const showListRouter = createTRPCRouter({
  setEpisodeWatched: setEpisodeWatchedProcedure,
  setSeasonWatched: setSeasonWatchedProcedure,
  createShow: createShowProcedure,
  deleteShow: deleteShowProcedure,
});
