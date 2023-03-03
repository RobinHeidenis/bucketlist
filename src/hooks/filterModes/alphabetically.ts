import type { Item } from './default';

export const sortAlphabetically = (a: Item, b: Item) => {
  let aTitle;
  if ('movie' in a) {
    aTitle = a.movie.title;
  } else {
    aTitle = a.title;
  }

  let bTitle;
  if ('movie' in b) {
    bTitle = b.movie.title;
  } else {
    bTitle = b.title;
  }

  if (aTitle.toLowerCase() < bTitle.toLowerCase()) return -1;
  if (aTitle.toLowerCase() > bTitle.toLowerCase()) return 1;
  return 0;
};

export const sortAlphabeticallyReverse = (a: Item, b: Item) => {
  let aTitle;
  if ('movie' in a) {
    aTitle = a.movie.title;
  } else {
    aTitle = a.title;
  }

  let bTitle;
  if ('movie' in b) {
    bTitle = b.movie.title;
  } else {
    bTitle = b.title;
  }

  if (aTitle.toLowerCase() < bTitle.toLowerCase()) return 1;
  if (aTitle.toLowerCase() > bTitle.toLowerCase()) return -1;
  return 0;
};