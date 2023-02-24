import type { Movie as MovieType } from '@prisma/client';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';
import {
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  TagIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { DropdownHeader } from '../dropdown/DropdownHeader';
import { DropdownItem } from '../dropdown/DropdownItem';
import { api } from '../../utils/api';

export const Movie = ({
  listId,
  itemId,
  checked,
  ...movie
}: MovieType & { checked: boolean; itemId: string; listId: string }) => {
  const context = api.useContext();
  const { mutate: setWatched } = api.movies.setMovieWatched.useMutation({
    onSuccess: () => {
      void context.lists.getList.invalidate({ id: listId });
    },
  });
  const { mutate: deleteMovie } = api.movies.deleteMovie.useMutation();

  return (
    <div>
      <div className="flex flex-row items-start justify-start">
        <Image
          src={movie.posterUrl ?? ''}
          alt={movie.title}
          width={80}
          height={120}
          className={`m-0 mr-4 ${checked ? 'grayscale' : ''}`}
        />
        <div className="items-between flex h-full flex-col">
          <div>
            <h3
              className={`m-0 ${checked ? 'text-slate-500 line-through' : ''}`}
            >
              {movie.title}
            </h3>
            <p
              className={`m-0 line-clamp-2 ${
                checked ? 'text-slate-500 line-through' : ''
              }`}
            >
              {movie.description}
            </p>
          </div>
          <div className="flex flex-row items-center">
            <StarIcon className="mr-1 h-5 w-5 text-amber-500" /> {movie.rating}
            <ClockIcon className="mr-1 ml-2 h-5 w-5" /> {movie.runtime}
            <TagIcon className="mr-1 ml-2 h-5 w-5" /> {movie.genres}
            <CalendarIcon className="mr-1 ml-2 h-5 w-5" /> {movie.releaseDate}
          </div>
        </div>
        <DropdownHeader>
          <DropdownItem
            onClick={() =>
              setWatched({
                id: itemId,
                checked: !checked,
              })
            }
          >
            {checked ? (
              <>
                <EyeSlashIcon className="h-6 w-6" /> Mark as unseen
              </>
            ) : (
              <>
                <EyeIcon className="h-6 w-6" /> mark as seen
              </>
            )}
          </DropdownItem>
          <DropdownItem onClick={() => deleteMovie({ id: itemId })} danger>
            <TrashIcon className="h-6 w-6" />
            Delete
          </DropdownItem>
        </DropdownHeader>
      </div>
      <div className="divider mt-2 mb-2" />
    </div>
  );
};
