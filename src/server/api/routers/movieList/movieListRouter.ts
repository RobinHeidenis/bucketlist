import { createTRPCRouter } from '~/server/api/trpc';
import { setMovieWatchedProcedure } from './setMovieWatched';
import { setCollectionCheckedProcedure } from './setCollectionChecked';
import { createMovieProcedure } from './createMovie';
import { createCollectionProcedure } from './createCollection';
import { deleteMovieProcedure } from './deleteMovie';
import { deleteCollectionProcedure } from './deleteCollection';

export const movieListRouter = createTRPCRouter({
  setMovieWatched: setMovieWatchedProcedure,
  setCollectionChecked: setCollectionCheckedProcedure,
  createMovie: createMovieProcedure,
  createCollection: createCollectionProcedure,
  deleteMovie: deleteMovieProcedure,
  deleteCollection: deleteCollectionProcedure,
});
