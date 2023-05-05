import { Autocomplete } from '../../form/Autocomplete';
import { useState } from 'react';
import { api } from '~/utils/api';
import type { z } from 'zod';
import { type TMDBSearchTVShow } from '~/types/TMDBMovie';
import { PosterImage } from '../../movie/PosterImage';
import { StarIcon } from '@heroicons/react/24/solid';
import { CalendarIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { ErrorToast } from '~/components/toasts/ErrorToast';

export const ShowListHeader = ({ listId }: { listId: string }) => {
  const [searchValue, setSearchValue] = useState('');
  const [selectedResult, setSelectedResult] = useState<z.infer<
    typeof TMDBSearchTVShow
  > | null>(null);
  const context = api.useContext();

  const { data, isFetching } = api.search.show.useQuery(
    { query: searchValue },
    { enabled: !!searchValue && searchValue.length > 2 },
  );

  const { mutate: createShow } = api.showList.createShow.useMutation({
    onSuccess: () => {
      setSearchValue('');
      setSelectedResult(null);
      void context.lists.getList.invalidate({ id: listId });
    },
    onError: (error) => {
      if (error.shape?.data.code === 'CONFLICT') {
        toast.custom(
          <ErrorToast message="That show is already on your list!" />,
        );
        setSearchValue('');
        setSelectedResult(null);
      }
    },
  });

  return (
    <div>
      <Autocomplete
        value={searchValue}
        onChange={setSearchValue}
        items={data ?? []}
        setSelectedResult={setSelectedResult}
        isLoading={isFetching}
      />
      {selectedResult && (
        <>
          <div className="mt-5 flex">
            <PosterImage
              alt={selectedResult.name}
              url={selectedResult.poster_path}
              width={152}
              height={225}
            />
            <div className="flex flex-col justify-between">
              <div>
                <h2 className="m-0">{selectedResult.name}</h2>
                <p className="mb-0 line-clamp-6">{selectedResult.overview}</p>
              </div>
              <div className="flex flex-row items-center">
                <StarIcon className="mr-1 h-5 w-5 text-amber-500" />{' '}
                {selectedResult.vote_average.toFixed(1)}
                <CalendarIcon className="ml-2 mr-1 h-5 w-5" />{' '}
                {selectedResult.first_air_date}
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              className="btn-primary btn"
              onClick={() => {
                if (!selectedResult) return;
                const params = { listId, showId: selectedResult?.id };
                createShow(params);
              }}
            >
              Add show
            </button>
          </div>
        </>
      )}
    </div>
  );
};
