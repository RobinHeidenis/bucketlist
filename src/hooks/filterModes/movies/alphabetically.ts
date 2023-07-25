import type { Item } from './default';
import { isCollection } from '~/types/List';

const getTitle = (a: Item, b: Item) => {
  let aTitle;
  if (isCollection(a)) {
    aTitle = a.name;
  } else {
    aTitle = a.title;
  }

  let bTitle;
  if (isCollection(b)) {
    bTitle = b.name;
  } else {
    bTitle = b.title;
  }

  return { aTitle, bTitle };
};

export const sortAlphabetically = (a: Item, b: Item) => {
  const { aTitle, bTitle } = getTitle(a, b);

  if (aTitle.toLowerCase() < bTitle.toLowerCase()) return -1;
  if (aTitle.toLowerCase() > bTitle.toLowerCase()) return 1;
  return 0;
};

export const sortAlphabeticallyReverse = (a: Item, b: Item) => {
  const { aTitle, bTitle } = getTitle(a, b);

  if (aTitle.toLowerCase() < bTitle.toLowerCase()) return 1;
  if (aTitle.toLowerCase() > bTitle.toLowerCase()) return -1;
  return 0;
};
