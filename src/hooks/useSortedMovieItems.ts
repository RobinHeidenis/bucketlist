import type { RouterOutputs } from '../utils/api';
import { useMemo } from 'react';

export const useSortedMovieItems = (
  listData: RouterOutputs['lists']['getList'],
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
    return [...listData.movieItems, ...collections].sort((a, b) => {
      let aTitle;
      let aChecked;
      if ('movie' in a) {
        aTitle = a.movie.title;
        aChecked = a.checked;
      } else {
        aTitle = a.title;
        aChecked = a.allChecked;
      }

      let bTitle;
      let bChecked;
      if ('movie' in b) {
        bTitle = b.movie.title;
        bChecked = b.checked;
      } else {
        bTitle = b.title;
        bChecked = b.allChecked;
      }

      if (aChecked && !bChecked) return 1;
      if (!aChecked && bChecked) return -1;

      if (aTitle.toLowerCase() < bTitle.toLowerCase()) return -1;
      if (aTitle.toLowerCase() > bTitle.toLowerCase()) return 1;
      return 0;
    });
  }, [listData.movieItems, collections]);
};
