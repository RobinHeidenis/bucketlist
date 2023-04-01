import type { Item } from './default';
import { isCollection } from '~/types/List';

const getTitleAndSeen = (a: Item, b: Item) => {
  let aSeen;
  let aTitle;
  if (isCollection(a)) {
    aSeen = a.allChecked;
    aTitle = a.name;
  } else {
    aSeen = a.checked;
    aTitle = a.title;
  }

  let bSeen;
  let bTitle;
  if (isCollection(b)) {
    bSeen = b.allChecked;
    bTitle = b.name;
  } else {
    bSeen = b.checked;
    bTitle = b.title;
  }
  return { aSeen, aTitle, bSeen, bTitle };
};

export const sortSeen = (a: Item, b: Item) => {
  const { aSeen, aTitle, bSeen, bTitle } = getTitleAndSeen(a, b);

  if (aSeen < bSeen) return 1;
  if (aSeen > bSeen) return -1;

  if (aTitle.toLowerCase() < bTitle.toLowerCase()) return -1;
  if (aTitle.toLowerCase() > bTitle.toLowerCase()) return 1;
  return 0;
};

export const sortSeenReverse = (a: Item, b: Item) => {
  const { aSeen, aTitle, bSeen, bTitle } = getTitleAndSeen(a, b);

  if (aSeen < bSeen) return -1;
  if (aSeen > bSeen) return 1;

  if (aTitle.toLowerCase() < bTitle.toLowerCase()) return -1;
  if (aTitle.toLowerCase() > bTitle.toLowerCase()) return 1;
  return 0;
};
