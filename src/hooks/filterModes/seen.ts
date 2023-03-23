import type { Item } from './default';

export const sortSeen = (a: Item, b: Item) => {
  let aSeen;
  let aTitle;
  if ('movie' in a) {
    aSeen = a.checked;
    aTitle = a.movie.title;
  } else {
    aSeen = a.allChecked;
    aTitle = a.title;
  }

  let bSeen;
  let bTitle;
  if ('movie' in b) {
    bSeen = b.checked;
    bTitle = b.movie.title;
  } else {
    bSeen = b.allChecked;
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
  if ('movie' in a) {
    aSeen = a.checked;
    aTitle = a.movie.title;
  } else {
    aSeen = a.allChecked;
    aTitle = a.title;
  }

  let bSeen;
  let bTitle;
  if ('movie' in b) {
    bSeen = b.checked;
    bTitle = b.movie.title;
  } else {
    bSeen = b.allChecked;
    bTitle = b.title;
  }

  //sort on seen and alphabetically
  if (aSeen < bSeen) return -1;
  if (aSeen > bSeen) return 1;

  if (aTitle.toLowerCase() < bTitle.toLowerCase()) return -1;
  if (aTitle.toLowerCase() > bTitle.toLowerCase()) return 1;
  return 0;
};
