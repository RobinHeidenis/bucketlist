import type { ShowListShow } from '~/types/List';

export const sortAlphabetically = (a: ShowListShow, b: ShowListShow) => {
  if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
  if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
  return 0;
};

export const sortAlphabeticallyReverse = (a: ShowListShow, b: ShowListShow) => {
  if (a.title.toLowerCase() < b.title.toLowerCase()) return 1;
  if (a.title.toLowerCase() > b.title.toLowerCase()) return -1;
  return 0;
};
