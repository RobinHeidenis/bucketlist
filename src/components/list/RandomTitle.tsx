import { useEffect, useRef, useState } from 'react';
import type { ListItem, Movie } from '@prisma/client';
import { PosterImage } from '../movie/PosterImage';
import autoAnimate from '@formkit/auto-animate';

export const RandomTitle = ({
  titles,
}: {
  titles: (ListItem & { movie: Movie })[];
}) => {
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
        Random title
      </button>
      <div className="flex flex-row" ref={parent}>
        {selectedIndex && titles[selectedIndex] && (
          <div className="flex flex-col items-center justify-center">
            <PosterImage
              alt={titles[selectedIndex]?.movie.title ?? ''}
              url={titles[selectedIndex]?.movie.posterUrl}
              width={152}
              height={225}
              className="mr-0"
            />
            <h3 className="m-0">{titles[selectedIndex]?.movie.title}</h3>
          </div>
        )}
      </div>
    </div>
  );
};
