import { StarIcon } from '@heroicons/react/24/solid';
import { CalendarIcon } from '@heroicons/react/24/outline';
import type { z } from 'zod';
import { type TMDBSearchTVShow } from '~/types/TMDBMovie';
import { PosterImage } from '../movie/PosterImage';

export const ShowResult = ({
  show,
}: {
  show: z.infer<typeof TMDBSearchTVShow>;
}) => {
  return (
    <div className="flex flex-row items-start justify-start">
      <PosterImage url={show.poster_path} alt={show.name} />
      <div className="items-between flex h-full flex-col">
        <div>
          <h3 className="m-0">{show.name}</h3>
          <p className="m-0 line-clamp-2">{show.overview}</p>
        </div>
        <div className="flex flex-row items-center">
          <StarIcon className="mr-1 h-5 w-5 text-amber-500" />{' '}
          {show.vote_average.toFixed(1)}
          <CalendarIcon className="ml-2 mr-1 h-5 w-5" /> {show.first_air_date}
        </div>
      </div>
    </div>
  );
};
