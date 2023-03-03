import type { RouterOutputs } from '../utils/api';
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
  listData: RouterOutputs['lists']['getList'],
  sort: keyof typeof sortMap = 'default',
) => {
  const collections = useMemo(() => {
    const collections = Object.values(listData.collections);
    return collections.map((collection) => {
      collection.items = collection.items.sort((a, b) => {
        if (a.movie.releaseDate < b.movie.releaseDate) return -1;
        if (a.movie.releaseDate > b.movie.releaseDate) return 1;
        return 0;
      });
      const allChecked = collection.items.every((item) => item.checked);
      return { ...collection, allChecked };
    });
  }, [listData.collections]);

  return useMemo(() => {
    return [...listData.movieItems, ...collections].sort(sortMap[sort]);
  }, [listData.movieItems, collections, sort]);
};
