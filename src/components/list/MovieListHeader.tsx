import { Autocomplete } from '../form/Autocomplete';
import { useState } from 'react';
import { api } from '../../utils/api';
import type { z } from 'zod';
import type { TMDBSearchMovie } from '../../types/TMDBMovie';
import { MovieImage } from '../movie/MovieImage';
import { StarIcon } from '@heroicons/react/24/solid';
import { CalendarIcon } from '@heroicons/react/24/outline';

export const MovieListHeader = ({ listId }: { listId: string }) => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<z.infer<
    typeof TMDBSearchMovie
  > | null>(null);
  const context = api.useContext();

  const { data, isFetching } = api.movies.search.useQuery(
    {
      query: searchValue,
    },
    { enabled: !!searchValue && searchValue.length > 2 },
  );

  const { mutate } = api.movies.createMovie.useMutation({
    onSuccess: () => {
      setSearchValue('');
      setSelectedMovie(null);
      void context.lists.getList.invalidate({ id: listId });
    },
  });

  return (
    <div>
      <Autocomplete
        value={searchValue}
        onChange={setSearchValue}
        items={data ?? []}
        setSelectedMovie={setSelectedMovie}
        isLoading={isFetching}
      />
      {selectedMovie && (
        <>
          <div className="mt-5 flex">
            <MovieImage
              alt={selectedMovie.title}
              url={selectedMovie.poster_path}
              width={152}
              height={225}
            />
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="m-0">{selectedMovie.title}</h2>
                <p className="mb-0 line-clamp-6">{selectedMovie.overview}</p>
              </div>
              <div className="flex flex-row items-center">
                <StarIcon className="mr-1 h-5 w-5 text-amber-500" />{' '}
                {selectedMovie.vote_average.toFixed(1)}
                <CalendarIcon className="mr-1 ml-2 h-5 w-5" />{' '}
                {selectedMovie.release_date}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              className="btn-primary btn"
              onClick={() => {
                if (!selectedMovie) return;
                mutate({ listId, externalId: selectedMovie?.id });
              }}
            >
              Add movie
            </button>
          </div>
        </>
      )}
    </div>
  );
};
