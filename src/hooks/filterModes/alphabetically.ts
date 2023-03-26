import type { Item } from './default';
import { isCollection } from '../../types/List';

export const sortAlphabetically = (a: Item, b: Item) => {
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

  if (aTitle.toLowerCase() < bTitle.toLowerCase()) return -1;
  if (aTitle.toLowerCase() > bTitle.toLowerCase()) return 1;
  return 0;
};

export const sortAlphabeticallyReverse = (a: Item, b: Item) => {
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

  if (aTitle.toLowerCase() < bTitle.toLowerCase()) return 1;
  if (aTitle.toLowerCase() > bTitle.toLowerCase()) return -1;
  return 0;
};
