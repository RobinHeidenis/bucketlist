import type { ShowListShow } from '~/types/List';

export const sortReleaseDate = (a: ShowListShow, b: ShowListShow) => {
  if (!a.releaseDate) return 1;
  if (!b.releaseDate) return -1;
  if (a.releaseDate < b.releaseDate) return 1;
  if (a.releaseDate > b.releaseDate) return -1;
  return 0;
};

export const sortReleaseDateReverse = (a: ShowListShow, b: ShowListShow) => {
  if (!a.releaseDate) return -1;
  if (!b.releaseDate) return 1;
  if (a.releaseDate < b.releaseDate) return -1;
  if (a.releaseDate > b.releaseDate) return 1;
  return 0;
};
