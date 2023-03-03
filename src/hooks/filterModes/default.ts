import type { ListItem, Movie } from '@prisma/client';

export type Item =
  | (ListItem & { movie: Movie })
  | {
      allChecked: boolean;
      id: number;
      title: string;
      description: string | null;
      posterUrl: string | null;
      items: (ListItem & { movie: Movie })[];
    };

export const sortDefault = (a: Item, b: Item) => {
  let aTitle;
  let aChecked;
  if ('movie' in a) {
    aTitle = a.movie.title;
    aChecked = a.checked;
  } else {
    aTitle = a.title;
    aChecked = a.allChecked;
  }

  let bTitle;
  let bChecked;
  if ('movie' in b) {
    bTitle = b.movie.title;
    bChecked = b.checked;
  } else {
    bTitle = b.title;
    bChecked = b.allChecked;
  }

  if (aChecked && !bChecked) return 1;
  if (!aChecked && bChecked) return -1;

  if (aTitle.toLowerCase() < bTitle.toLowerCase()) return -1;
  if (aTitle.toLowerCase() > bTitle.toLowerCase()) return 1;
  return 0;
};