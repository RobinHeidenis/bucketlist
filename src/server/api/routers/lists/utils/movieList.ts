import {
  type DBMovieList,
  type MovieList,
  type MovieListCollection,
  type MovieListMovie,
} from '~/types/List';
import { convertImageHash } from '~/server/api/routers/utils/convertImageHash';
import { type ListBase } from '~/server/api/routers/lists/utils/getListBase';
import { type prisma } from '~/server/db';

export const getMovieList = (db: typeof prisma, id: string) =>
  db.list.findUnique({
    where: { id },
    include: {
      movies: true,
      collections: { include: { movies: true } },
      checkedMovies: true,
      owner: { select: { id: true } },
      collaborators: { select: { id: true } },
    },
  });

export const formatMovieList = (list: MovieList, base: ListBase): MovieList => {
  const checkedMoviesSet = new Set(
    (list as unknown as DBMovieList).checkedMovies.map((m) => m.movieId),
  );

  const addCheckedPropToMovie = (movie: MovieListMovie) => ({
    ...movie,
    imageHash: convertImageHash(movie.imageHash),
    checked: checkedMoviesSet.has(movie.id),
  });

  const collections = list.collections.map((collection) => {
    // Filter movies on having a release date, as this is usually a good indicator of if the movie is at all confirmed or just a speculation.
    const filteredMovies = collection.movies.filter(
      (movie) => movie.releaseDate,
    );

    const checkedMoviesInCollection = filteredMovies.filter((movie) =>
      checkedMoviesSet.has(movie.id),
    );

    return {
      ...collection,
      imageHash: convertImageHash(collection.imageHash),
      movies: filteredMovies.map(addCheckedPropToMovie),
      allChecked: checkedMoviesInCollection.length === filteredMovies.length,
      amountChecked: checkedMoviesInCollection.length,
    } satisfies MovieListCollection;
  });

  const moviesWithCheckedFlag = list.movies.map(addCheckedPropToMovie);

  return {
    ...base,
    collections: collections,
    movies: moviesWithCheckedFlag,
    total:
      moviesWithCheckedFlag.length +
      collections.reduce((sum, c) => sum + c.movies.length, 0),
    totalChecked: checkedMoviesSet.size,
    updatedAt: list.updatedAt,
  };
};
