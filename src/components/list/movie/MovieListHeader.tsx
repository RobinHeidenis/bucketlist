import { Autocomplete } from '../../form/Autocomplete';
import { useState } from 'react';
import { api } from '~/utils/api';
import type { z } from 'zod';
import type { TMDBSearchCollection, TMDBSearchMovie } from '~/types/TMDBMovie';
import { PosterImage } from '../../movie/PosterImage';
import { StarIcon } from '@heroicons/react/24/solid';
import { CalendarIcon, PlusIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ErrorToast } from '~/components/toasts/ErrorToast';
import { type PropsWithMovieList } from '~/types/List';
import { showErrorToast } from '~/utils/showErrorToast';
import { useDebouncedValue } from '@mantine/hooks';

export const MovieListHeader = ({ list }: PropsWithMovieList) => {
  const [searchValue, setSearchValue] = useState('');
  const [debouncedSearchValue] = useDebouncedValue(searchValue, 500);
  const [selectedResult, setSelectedResult] = useState<
    | z.infer<typeof TMDBSearchMovie>
    | z.infer<typeof TMDBSearchCollection>
    | null
  >(null);
  const context = api.useUtils();

  const { data, isFetching } = api.search.movie.useQuery(
    { query: debouncedSearchValue },
    { enabled: !!debouncedSearchValue && debouncedSearchValue.length > 2 },
  );

  const { mutate: createMovie, isLoading: isCreateMovieLoading } =
    api.movieList.createMovie.useMutation({
      onSuccess: () => {
        setSearchValue('');
        setSelectedResult(null);
        void context.lists.getList.invalidate({ id: list.id });
      },
      onError: (error) => {
        if (error.shape?.data.code === 'CONFLICT') {
          toast.custom(
            <ErrorToast message="That movie is already in your list!" />,
          );
          setSearchValue('');
          setSelectedResult(null);
        } else showErrorToast(error);
      },
    });
  const { mutate: createCollection, isLoading: isCreateCollectionLoading } =
    api.movieList.createCollection.useMutation({
      onSuccess: () => {
        setSearchValue('');
        setSelectedResult(null);
        void context.lists.getList.invalidate({ id: list.id });
      },
      onError: (error) => {
        if (error.shape?.data.code === 'CONFLICT') {
          toast.custom(
            <ErrorToast message="That collection is already in your list!" />,
          );
          setSearchValue('');
          setSelectedResult(null);
        } else showErrorToast(error);
      },
    });

  const filteredData = data?.filter(
    (result) =>
      !list.movies.some((movie) => movie.id === result.id) &&
      !list.collections.some((collection) => collection.id === result.id),
  );

  const isMovie = selectedResult && 'title' in selectedResult;

  return (
    <div>
      <Autocomplete
        value={searchValue}
        onChange={setSearchValue}
        items={filteredData ?? []}
        setSelectedResult={setSelectedResult}
        isLoading={isFetching}
        hasHiddenItems={
          filteredData && data ? filteredData.length < data.length : false
        }
      />
      {selectedResult && (
        <>
          <div className="mt-5 flex">
            <PosterImage
              alt={isMovie ? selectedResult.title : selectedResult.name}
              url={selectedResult.poster_path}
              width={152}
              height={225}
            />
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="m-0">
                  {isMovie ? selectedResult.title : selectedResult.name}
                </h2>
                {isMovie && (
                  <p className="mb-0 line-clamp-6">{selectedResult.overview}</p>
                )}
              </div>
              {isMovie && (
                <div className="flex flex-row items-center">
                  <StarIcon className="mr-1 h-5 w-5 text-amber-500" />{' '}
                  {selectedResult.vote_average.toFixed(1)}
                  <CalendarIcon className="ml-2 mr-1 h-5 w-5" />{' '}
                  {selectedResult.release_date}
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end">
            <button
              className="btn btn-primary"
              onClick={() => {
                const params = {
                  listId: list.id,
                  externalId: selectedResult.id,
                } satisfies Parameters<typeof createMovie>[number];
                isMovie ? createMovie(params) : createCollection(params);
              }}
            >
              <PlusIcon
                className={`h-5 w-5
                  ${
                    isCreateCollectionLoading || isCreateMovieLoading
                      ? 'loading'
                      : ''
                  }
                `}
              />
              Add {isMovie ? 'movie' : 'collection'}
            </button>
          </div>
        </>
      )}
    </div>
  );
};
