import { useMemo } from 'react';
import {
  sortAlphabetically,
  sortAlphabeticallyReverse,
  sortDefault,
  sortRating,
  sortRatingReverse,
  sortReleaseDate,
  sortReleaseDateReverse,
  sortSeen,
  sortSeenReverse,
} from './filterModes';
import type { MovieList } from '../types/List';

export const sortMap = {
  default: sortDefault,
  alphabetically: sortAlphabetically,
  alphabeticallyReverse: sortAlphabeticallyReverse,
  releaseDate: sortReleaseDate,
  releaseDateReverse: sortReleaseDateReverse,
  seen: sortSeen,
  notSeen: sortSeenReverse,
  rating: sortRating,
  ratingReverse: sortRatingReverse,
};

export const useSortedMovieItems = (
  list: MovieList,
  sort: keyof typeof sortMap = 'default',
) => {
  const collections = useMemo(() => {
    if (!('collections' in list) || !list.collections) return [];
    const collections = Object.values(list.collections);
    return collections.map((collection) => {
      collection.movies = collection.movies.sort((a, b) => {
        if (a.releaseDate < b.releaseDate) return -1;
        if (a.releaseDate > b.releaseDate) return 1;
        return 0;
      });
      return collection;
    });
  }, [list]);

  return useMemo(() => {
    if (!('movies' in list) || !list.movies) return [];
    return [...list.movies, ...collections].sort(sortMap[sort]);
  }, [list, collections, sort]);
};
