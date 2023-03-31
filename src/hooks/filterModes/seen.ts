import type { Item } from './default';
import { isCollection } from '../../types/List';

export const sortSeen = (a: Item, b: Item) => {
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

  if (aSeen < bSeen) return 1;
  if (aSeen > bSeen) return -1;

  if (aTitle.toLowerCase() < bTitle.toLowerCase()) return -1;
  if (aTitle.toLowerCase() > bTitle.toLowerCase()) return 1;
  return 0;
};

export const sortSeenReverse = (a: Item, b: Item) => {
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

  //sort on seen and alphabetically
  if (aSeen < bSeen) return -1;
  if (aSeen > bSeen) return 1;

  if (aTitle.toLowerCase() < bTitle.toLowerCase()) return -1;
  if (aTitle.toLowerCase() > bTitle.toLowerCase()) return 1;
  return 0;
};
