import { useState } from 'react';
import { PosterImage } from '../movie/PosterImage';
import type { MovieListMovie } from '~/types/List';
import { DiceIcon } from '~/components/list/movie/DiceIcon';
import { XMarkIcon } from '@heroicons/react/24/outline';

export const RandomTitle = ({ titles }: { titles: MovieListMovie[] }) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const roll = () => {
    setSelectedIndex(Math.floor(Math.random() * titles.length));
  };

  return (
    <div className="flex w-full flex-col items-center">
      <button className="btn-ghost btn" onClick={roll}>
        <DiceIcon /> Random title
      </button>
      <div className="flex flex-row">
        {selectedIndex && titles[selectedIndex] && (
          <div className="mt-5 flex flex-col items-center justify-center">
            <XMarkIcon
              className="h-5 w-5"
              onClick={() => setSelectedIndex(null)}
            />
            <PosterImage
              alt={titles[selectedIndex]?.title ?? ''}
              url={titles[selectedIndex]?.posterUrl}
              width={152}
              height={225}
              noMargin
            />
            <h3 className="m-0">{titles[selectedIndex]?.title}</h3>
          </div>
        )}
      </div>
    </div>
  );
};
