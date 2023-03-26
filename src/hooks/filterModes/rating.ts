import type { Item } from './default';
import { isCollection } from '../../types/List';

export const sortRating = (a: Item, b: Item) => {
  let aRating;
  if (isCollection(a)) {
    return 1;
  } else {
    aRating = a.rating ?? 0;
  }

  let bRating;
  if (isCollection(b)) {
    return -1;
  } else {
    bRating = b.rating ?? 0;
  }

  if (aRating < bRating) return 1;
  if (aRating > bRating) return -1;
  return 0;
};

export const sortRatingReverse = (a: Item, b: Item) => {
  let aRating;
  if (isCollection(a)) {
    return 1;
  } else {
    aRating = a.rating ?? 0;
  }

  let bRating;
  if (isCollection(b)) {
    return -1;
  } else {
    bRating = b.rating ?? 0;
  }

  if (aRating < bRating) return -1;
  if (aRating > bRating) return 1;
  return 0;
};
