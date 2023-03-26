import type { Item } from './default';
import { isCollection } from '../../types/List';

export const sortReleaseDate = (a: Item, b: Item) => {
  let aReleaseDate;
  if (isCollection(a)) {
    return 1;
  } else {
    aReleaseDate = a.releaseDate;
  }

  let bReleaseDate;
  if (isCollection(b)) {
    return -1;
  } else {
    bReleaseDate = b.releaseDate;
  }

  if (aReleaseDate < bReleaseDate) return 1;
  if (aReleaseDate > bReleaseDate) return -1;
  return 0;
};

export const sortReleaseDateReverse = (a: Item, b: Item) => {
  let aReleaseDate;
  if (isCollection(a)) {
    return 1;
  } else {
    aReleaseDate = a.releaseDate;
  }

  let bReleaseDate;
  if (isCollection(b)) {
    return -1;
  } else {
    bReleaseDate = b.releaseDate;
  }

  if (aReleaseDate < bReleaseDate) return -1;
  if (aReleaseDate > bReleaseDate) return 1;
  return 0;
};
