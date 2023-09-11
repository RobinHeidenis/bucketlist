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

export type ShowListShow = Omit<Show, 'imageHash'> & {
  imageHash?: Uint8Array | null;
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

export type MovieListMovie = Omit<Movie, 'imageHash'> & {
  checked: boolean;
  imageHash?: Uint8Array | null;
};

export type MovieListCollection = Omit<Collection, 'movies' | 'imageHash'> & {
  imageHash?: Uint8Array | null;
  movies: MovieListMovie[];
  allChecked: boolean;
  amountChecked: number;
};

export type MovieList = Omit<
  Omit<DBMovieList, 'movies' | 'collections'> & {
    movies: MovieListMovie[];
    collections: MovieListCollection[];
    total: number;
    totalChecked: number;
  },
  'checkedMovies'
>;

export type ListType = BucketList | MovieList | ShowList;

export type PropsWithGenericList<
  T = unknown,
  L extends ListType = ListType,
> = T & { list: L };

export type PropsWithList<T = unknown> = PropsWithGenericList<T>;

export type PropsWithMovieList<T = unknown> = PropsWithGenericList<
  T,
  MovieList
>;

export type PropsWithShowList<T = unknown> = PropsWithGenericList<T, ShowList>;

export type PropsWithBucketList<T = unknown> = PropsWithGenericList<
  T,
  BucketList
>;

export type LooseListType =
  | Omit<BucketList, 'total' | 'totalChecked' | 'owner'>
  | Omit<DBMovieList, 'owner'>
  | Omit<BucketList, 'owner'>
  | Omit<MovieList, 'owner'>
  | Omit<ShowList, 'owner'>
  | Omit<DBShowList, 'owner'>;

export const isBucketList = (list: LooseListType): list is BucketList =>
  list.type === 'BUCKET';

export const isCollection = (
  item: MovieListCollection | MovieListMovie,
): item is MovieListCollection => 'movies' in item;

export const isMovieList = (list: LooseListType): list is MovieList =>
  list.type === 'MOVIE';

export const isShowList = (list: LooseListType): list is ShowList =>
  list.type === 'SHOW';
