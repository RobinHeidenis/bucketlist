import type {
  BucketListItem,
  CheckedMovie,
  Collection,
  List,
  Movie,
} from '@prisma/client';

type Owner = {
  id: string;
  name: string | null;
};

type Collaborator = {
  id: string;
};

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

export function isBucketList(
  list:
    | Omit<BucketList, 'total' | 'totalChecked'>
    | DBMovieList
    | BucketList
    | MovieList,
): list is BucketList {
  return list.type === 'BUCKET';
}

export function isCollection(
  item: MovieListCollection | MovieListMovie,
): item is MovieListCollection {
  return 'movies' in item;
}
