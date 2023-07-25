import type { ShowListShow } from '~/types/List';

export const sortRating = (a: ShowListShow, b: ShowListShow) => {
  const aRating = a.rating || 0;
  const bRating = b.rating || 0;
  if (aRating < bRating) return 1;
  if (aRating > bRating) return -1;
  return 0;
};

export const sortRatingReverse = (a: ShowListShow, b: ShowListShow) => {
  const aRating = a.rating || 0;
  const bRating = b.rating || 0;
  if (aRating < bRating) return -1;
  if (aRating > bRating) return 1;
  return 0;
};
