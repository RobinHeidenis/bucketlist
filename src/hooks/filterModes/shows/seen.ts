import type { ShowListShow } from '~/types/List';

export const sortSeen = (a: ShowListShow, b: ShowListShow) => {
  if (a.allChecked && !b.allChecked) return -1;
  if (!a.allChecked && b.allChecked) return 1;
  return 0;
};

export const sortSeenReverse = (a: ShowListShow, b: ShowListShow) => {
  if (a.allChecked && !b.allChecked) return 1;
  if (!a.allChecked && b.allChecked) return -1;
  return 0;
};
