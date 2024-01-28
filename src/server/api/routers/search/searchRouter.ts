import { createTRPCRouter } from '~/server/api/trpc';
import { searchMovieProcedure } from './searchMovie';
import { searchShowProcedure } from './searchShow';

export const searchRouter = createTRPCRouter({
  movie: searchMovieProcedure,
  show: searchShowProcedure,
});
