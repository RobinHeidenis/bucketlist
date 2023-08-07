import type {
  BucketListItem,
  CheckedEpisode,
  CheckedMovie,
  Collection,
  Episode,
  List as DBList,
  Movie,
  Season,
  Show,
} from '@prisma/client';

interface Owner {
  id: string;
  name: string | null;
}

interface Collaborator {
  id: string;
}

type List = Omit<DBList, 'ownerId'>;

export type DBMovieList = List & {
  movies: Movie[];
  collections: (Collection & { movies: Movie[] })[];
  checkedMovies: CheckedMovie[];
  owner: Owner;
  collaborators: Collaborator[];
};

export type BucketList = List & {
  bucketListItems: BucketListItem[];
  owner: Owner;
  collaborators: Collaborator[];
  total: number;
  totalChecked: number;
};

export type ShowListEpisode = Episode & { checked: boolean };

export type ShowListSeason = Season & {
  episodes: ShowListEpisode[];
  allChecked: boolean;
  amountChecked: number;
};

export type ShowListShow = Show & {
  seasons: ShowListSeason[];
  allChecked: boolean;
  amountChecked: number;
};

export type DBShowList = List & {
  shows: (Show & { seasons: (Season & { episodes: Episode[] })[] })[];
  checkedEpisodes: CheckedEpisode[];
  owner: Owner;
  collaborators: Collaborator[];
};

export type ShowList = Omit<DBShowList, 'shows'> & {
  shows: ShowListShow[];
  total: number;
  totalChecked: number;
};

export type MovieListMovie = Movie & { checked: boolean };

export type MovieListCollection = Omit<Collection, 'movies'> & {
  movies: MovieListMovie[];
  allChecked: boolean;
  amountChecked: number;
};

export type MovieList = Omit<
  Omit<DBMovieList, 'movies'> & {
    movies: MovieListMovie[];
    collections: MovieListCollection[];
    total: number;
    totalChecked: number;
  },
  'checkedMovies'
>;

export type ListType =
  | Omit<BucketList, 'total' | 'totalChecked' | 'owner'>
  | Omit<DBMovieList, 'owner'>
  | Omit<BucketList, 'owner'>
  | Omit<MovieList, 'owner'>
  | Omit<ShowList, 'owner'>
  | Omit<DBShowList, 'owner'>;

export const isBucketList = (list: ListType): list is BucketList =>
  list.type === 'BUCKET';

export const isCollection = (
  item: MovieListCollection | MovieListMovie,
): item is MovieListCollection => 'movies' in item;

export const isMovieList = (list: ListType): list is MovieList =>
  list.type === 'MOVIE';

export const isShowList = (list: ListType): list is ShowList =>
  list.type === 'SHOW';
