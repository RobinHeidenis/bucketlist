import { useEffect, useRef, useState } from 'react';
import { PosterImage } from '../movie/PosterImage';
import autoAnimate from '@formkit/auto-animate';
import type { MovieListMovie } from '~/types/List';
import { DiceIcon } from '~/components/list/movie/DiceIcon';

export const RandomTitle = ({ titles }: { titles: MovieListMovie[] }) => {
  const parent = useRef(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  useEffect(() => {
    parent.current && autoAnimate(parent.current);
  }, [parent]);

  const roll = () => {
    setSelectedIndex(Math.floor(Math.random() * titles.length));
  };

  return (
    <div className="flex w-full flex-col items-center">
      <button className="btn-ghost btn mb-5" onClick={roll}>
        <DiceIcon /> Random title
      </button>
      <div className="flex flex-row" ref={parent}>
        {selectedIndex && titles[selectedIndex] && (
          <div className="flex flex-col items-center justify-center">
            <PosterImage
              alt={titles[selectedIndex]?.title ?? ''}
              url={titles[selectedIndex]?.posterUrl}
              width={152}
              height={225}
              className="mr-0"
            />
            <h3 className="m-0">{titles[selectedIndex]?.title}</h3>
          </div>
        )}
      </div>
    </div>
  );
};
