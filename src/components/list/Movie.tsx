import type { Movie as MovieType } from '@prisma/client';
import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';
import {
  CalendarIcon,
  ClockIcon,
  EyeIcon,
  TagIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { DropdownHeader } from '../dropdown/DropdownHeader';
import { DropdownItem } from '../dropdown/DropdownItem';

export const Movie = (movie: MovieType & { checked: boolean }) => {
  return (
    <div>
      <div className="flex flex-row items-start justify-start">
        <Image
          src={movie.posterUrl ?? ''}
          alt={movie.title}
          width={80}
          height={120}
          className="m-0 mr-4"
        />
        <div className="items-between flex h-full flex-col">
          <div>
            <h3 className="m-0">{movie.title}</h3>
            <p className="m-0 line-clamp-2">{movie.description}</p>
          </div>
          <div className="flex flex-row items-center">
            <StarIcon className="mr-1 h-5 w-5 text-amber-500" /> {movie.rating}
            <ClockIcon className="mr-1 ml-2 h-5 w-5" /> {movie.runtime}
            <TagIcon className="mr-1 ml-2 h-5 w-5" /> {movie.genres}
            <CalendarIcon className="mr-1 ml-2 h-5 w-5" /> {movie.releaseDate}
          </div>
        </div>
        <DropdownHeader>
          <DropdownItem onClick={() => console.log('seen')}>
            <EyeIcon className="h-6 w-6" />
            Mark as seen
          </DropdownItem>
          <DropdownItem onClick={() => console.log('Delete')} danger>
            <TrashIcon className="h-6 w-6" />
            Delete
          </DropdownItem>
        </DropdownHeader>
      </div>
      <div className="divider m-0" />
    </div>
  );
};
