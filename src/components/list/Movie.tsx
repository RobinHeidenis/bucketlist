import type { Movie as MovieType } from '@prisma/client';
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
import { MovieImage } from '../movie/MovieImage';

const toHoursAndMinutes = (totalMinutes: number) => {
  if (totalMinutes === 0) return '0';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours ? `${hours}h` : ''} ${minutes > 0 ? ` ${minutes}m` : ''}`;
};

export const Movie = ({
  listId,
  itemId,
  checked,
  isOwner,
  isCollaborator,
  ...movie
}: MovieType & {
  checked: boolean;
  itemId: string;
  listId: string;
  isOwner: boolean;
  isCollaborator: boolean;
}) => {
  const context = api.useContext();
  const { mutate: setWatched } = api.movies.setMovieWatched.useMutation({
    onSuccess: () => {
      void context.lists.getList.invalidate({ id: listId });
    },
  });
  const { mutate: deleteMovie } = api.movies.deleteMovie.useMutation({
    onSuccess: () => {
      void context.lists.getList.invalidate({ id: listId });
    },
  });

  return (
    <div>
      <div className="flex flex-row items-start justify-between">
        <div className="flex flex-row items-start">
          <MovieImage
            alt={movie.title}
            url={movie.posterUrl}
            width={80}
            height={120}
            className={`m-0 mr-4 ${checked ? 'grayscale' : ''}`}
          />
          <div className="flex h-full flex-col justify-between">
            <div>
              <h3
                className={`m-0 ${
                  checked ? 'text-slate-500 line-through' : ''
                }`}
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
              <StarIcon className="mr-1 h-5 w-5 text-amber-500" />{' '}
              {movie.rating}
              <ClockIcon className="mr-1 ml-2 h-5 w-5" />{' '}
              {toHoursAndMinutes(movie.runtime ?? 0)}
              <CalendarIcon className="mr-1 ml-2 h-5 w-5" />{' '}
              {movie.releaseDate || 'unknown'}
              {movie.genres ? (
                <div
                  className="tooltip flex flex-row items-center"
                  data-tip={movie.genres}
                >
                  <TagIcon className="mr-1 ml-2 h-5 w-5" />
                  {movie.genres?.split(',')[0]}, ...
                </div>
              ) : (
                <>
                  <TagIcon className="mr-1 ml-2 h-5 w-5" /> none
                </>
              )}
            </div>
          </div>
        </div>
        {(isOwner || isCollaborator) && (
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
        )}
      </div>
      <div className="divider mt-2 mb-2" />
    </div>
  );
};
