import type { Item } from './default';

export const sortRating = (a: Item, b: Item) => {
  let aRating;
  if ('movie' in a) {
    aRating = a.movie.rating ?? 0;
  } else {
    return 1;
  }

  let bRating;
  if ('movie' in b) {
    bRating = b.movie.rating ?? 0;
  } else {
    return -1;
  }

  if (aRating < bRating) return 1;
  if (aRating > bRating) return -1;
  return 0;
};

export const sortRatingReverse = (a: Item, b: Item) => {
  let aRating;
  if ('movie' in a) {
    aRating = a.movie.rating ?? 0;
  } else {
    return 1;
  }

  let bRating;
  if ('movie' in b) {
    bRating = b.movie.rating ?? 0;
  } else {
    return -1;
  }

  if (aRating < bRating) return -1;
  if (aRating > bRating) return 1;
  return 0;
};