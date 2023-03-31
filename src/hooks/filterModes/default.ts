import type { MovieListCollection, MovieListMovie } from '../../types/List';
import { isCollection } from '../../types/List';

export type Item = MovieListMovie | MovieListCollection;

export const sortDefault = (a: Item, b: Item) => {
  let aTitle;
  let aChecked;
  if (isCollection(a)) {
    aTitle = a.name;
    aChecked = a.allChecked;
  } else {
    aTitle = a.title;
    aChecked = a.checked;
  }

  let bTitle;
  let bChecked;
  if (isCollection(b)) {
    bTitle = b.name;
    bChecked = b.allChecked;
  } else {
    bTitle = b.title;
    bChecked = b.checked;
  }

  if (aChecked && !bChecked) return 1;
  if (!aChecked && bChecked) return -1;

  if (aTitle.toLowerCase() < bTitle.toLowerCase()) return -1;
  if (aTitle.toLowerCase() > bTitle.toLowerCase()) return 1;
  return 0;
};
