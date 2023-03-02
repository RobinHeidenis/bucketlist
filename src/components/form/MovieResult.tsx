import { StarIcon } from '@heroicons/react/24/solid';
import { CalendarIcon } from '@heroicons/react/24/outline';
import type { z } from 'zod';
import type { TMDBSearchMovie } from '../../types/TMDBMovie';
import { PosterImage } from '../movie/PosterImage';

export const MovieResult = ({
  movie,
}: {
  movie: z.infer<typeof TMDBSearchMovie>;
}) => {
  return (
    <div className="flex flex-row items-start justify-start">
      <PosterImage url={movie.poster_path} alt={movie.title} />
      <div className="items-between flex h-full flex-col">
        <div>
          <h3 className="m-0">{movie.title}</h3>
          <p className="m-0 line-clamp-2">{movie.overview}</p>
        </div>
        <div className="flex flex-row items-center">
          <StarIcon className="mr-1 h-5 w-5 text-amber-500" />{' '}
          {movie.vote_average.toFixed(1)}
          <CalendarIcon className="mr-1 ml-2 h-5 w-5" /> {movie.release_date}
        </div>
      </div>
    </div>
  );
};
