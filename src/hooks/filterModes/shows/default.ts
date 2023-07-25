import type { ShowListShow } from '~/types/List';

export const sortDefault = (a: ShowListShow, b: ShowListShow) => {
  if (a.allChecked && !b.allChecked) return 1;
  if (!a.allChecked && b.allChecked) return -1;

  if (a.title.toLowerCase() < b.title.toLowerCase()) return -1;
  if (a.title.toLowerCase() > b.title.toLowerCase()) return 1;
  return 0;
};
