import { StarIcon } from '@heroicons/react/24/solid';
import {
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  EyeSlashIcon,
  TagIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { DropdownHeader } from '../../dropdown/DropdownHeader';
import { DropdownItem } from '../../dropdown/DropdownItem';
import { api } from '~/utils/api';
import { PosterImage } from '../../movie/PosterImage';
import type { MovieListMovie } from '~/types/List';
import { FlexRowCenter } from '~/components/style/FlexRowCenter';
import { useState } from 'react';

const toHoursAndMinutes = (totalMinutes: number) => {
  if (totalMinutes === 0) return '0';
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours ? `${hours}h` : ''} ${minutes > 0 ? ` ${minutes}m` : ''}`;
};

interface MovieProps {
  movie: MovieListMovie;
  listId: string;
  isOwner: boolean;
  isCollaborator: boolean;
  hideDivider?: boolean;
}

export const Movie = ({
  listId,
  isOwner,
  isCollaborator,
  hideDivider,
  movie,
}: MovieProps) => {
  const [showDescription, setShowDescription] = useState(false);
  const context = api.useContext();
  const { mutate: setWatched } = api.movieList.setMovieWatched.useMutation({
    onSuccess: () => {
      void context.lists.getList.invalidate({ id: listId });
    },
  });
  const { mutate: deleteMovie } = api.movieList.deleteMovie.useMutation({
    onSuccess: () => {
      void context.lists.getList.invalidate({ id: listId });
    },
  });

  return (
    <div>
      <div className="flex flex-row items-start justify-between">
        <div className="flex flex-row items-start">
          <PosterImage
            alt={movie.title}
            url={movie.posterUrl}
            width={80}
            height={120}
            className={`m-0 mr-4 ${movie.checked ? 'grayscale' : ''}`}
          />
          <div className="flex h-full flex-col justify-between">
            <div>
              <h3
                className={`m-0 ${
                  movie.checked ? 'text-slate-500 line-through' : ''
                }`}
              >
                {movie.title}
              </h3>
              <p
                className={`m-0 ${showDescription ? '' : 'line-clamp-2'} ${
                  movie.checked ? 'text-slate-500 line-through' : ''
                }`}
                onClick={() => setShowDescription(!showDescription)}
              >
                {movie.description}
              </p>
            </div>
            <div className="flex flex-col sm:flex sm:flex-row sm:flex-wrap sm:items-center">
              <FlexRowCenter sx="whitespace-nowrap">
                <StarIcon className="mr-1 h-5 w-5 flex-shrink-0 text-amber-500" />
                {movie.rating}
              </FlexRowCenter>
              <FlexRowCenter sx="whitespace-nowrap">
                <ClockIcon className="ml-2 mr-1 h-5 w-5 flex-shrink-0" />
                {toHoursAndMinutes(movie.runtime ?? 0)}
              </FlexRowCenter>
              <FlexRowCenter sx="whitespace-nowrap">
                <CalendarIcon className="ml-2 mr-1 h-5 w-5 flex-shrink-0" />
                {movie.releaseDate || 'unknown'}
              </FlexRowCenter>
              {movie.genres ? (
                <div
                  className="tooltip col-span-2 flex min-w-0 max-w-full flex-row items-center justify-start"
                  data-tip={movie.genres}
                >
                  <TagIcon className="ml-2 mr-1 h-5 w-5 flex-shrink-0" />
                  <div className={'whitespace-wrap line-clamp-1 text-start'}>
                    {movie.genres}
                  </div>
                </div>
              ) : (
                <>
                  <TagIcon className="ml-2 mr-1 h-5 w-5" /> none
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
                  id: movie.id,
                  listId,
                  checked: !movie.checked,
                })
              }
            >
              {movie.checked ? (
                <>
                  <EyeSlashIcon className="h-6 w-6" /> Mark as unseen
                </>
              ) : (
                <>
                  <EyeIcon className="h-6 w-6" /> mark as seen
                </>
              )}
            </DropdownItem>
            <DropdownItem
              onClick={() => deleteMovie({ id: movie.id, listId })}
              danger
            >
              <TrashIcon className="h-6 w-6" />
              Delete
            </DropdownItem>
          </DropdownHeader>
        )}
      </div>
      {!hideDivider && <div className="divider mb-2 mt-2" />}
    </div>
  );
};