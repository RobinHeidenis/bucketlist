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
} from '~/hooks/filterModes/shows';
import { useMemo } from 'react';
import type { ShowListShow } from '~/types/List';

export const sortMap: Record<
  string,
  (a: ShowListShow, b: ShowListShow) => number
> = {
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

export const useSortedShows = (
  shows: ShowListShow[],
  sort: keyof typeof sortMap = 'default',
) => {
  return useMemo(() => {
    return shows.sort(sortMap[sort]);
  }, [shows, sort]);
};
