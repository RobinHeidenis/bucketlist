import type { Item } from './default';

export const sortSeen = (a: Item, b: Item) => {
  let aSeen;
  if ('movie' in a) {
    aSeen = a.checked;
  } else {
    return 1;
  }

  let bSeen;
  if ('movie' in b) {
    bSeen = b.checked;
  } else {
    return -1;
  }

  if (aSeen < bSeen) return 1;
  if (aSeen > bSeen) return -1;
  return 0;
};

export const sortSeenReverse = (a: Item, b: Item) => {
  let aSeen;
  if ('movie' in a) {
    aSeen = a.checked;
  } else {
    return 1;
  }

  let bSeen;
  if ('movie' in b) {
    bSeen = b.checked;
  } else {
    return -1;
  }

  if (aSeen < bSeen) return -1;
  if (aSeen > bSeen) return 1;
  return 0;
};
