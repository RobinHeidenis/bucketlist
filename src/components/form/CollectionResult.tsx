import type { z } from 'zod';
import type { TMDBSearchCollection } from '../../types/TMDBMovie';
import { PosterImage } from '../movie/PosterImage';

export const CollectionResult = ({
  collection,
}: {
  collection: z.infer<typeof TMDBSearchCollection>;
}) => {
  return (
    <div className="flex flex-row items-start justify-start">
      <PosterImage url={collection.poster_path} alt={collection.name} />
      <div className="items-between flex h-full flex-col">
        <div>
          <h3 className="m-0">{collection.name}</h3>
        </div>
      </div>
    </div>
  );
};
