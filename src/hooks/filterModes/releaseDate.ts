import type { Item } from './default';

export const sortReleaseDate = (a: Item, b: Item) => {
  let aReleaseDate;
  if ('movie' in a) {
    aReleaseDate = a.movie.releaseDate;
  } else {
    return 1;
  }

  let bReleaseDate;
  if ('movie' in b) {
    bReleaseDate = b.movie.releaseDate;
  } else {
    return -1;
  }

  if (aReleaseDate < bReleaseDate) return 1;
  if (aReleaseDate > bReleaseDate) return -1;
  return 0;
};

export const sortReleaseDateReverse = (a: Item, b: Item) => {
  let aReleaseDate;
  if ('movie' in a) {
    aReleaseDate = a.movie.releaseDate;
  } else {
    return 1;
  }

  let bReleaseDate;
  if ('movie' in b) {
    bReleaseDate = b.movie.releaseDate;
  } else {
    return -1;
  }

  if (aReleaseDate < bReleaseDate) return -1;
  if (aReleaseDate > bReleaseDate) return 1;
  return 0;
};