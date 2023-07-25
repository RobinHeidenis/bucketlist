import { useState } from 'react';
import { PosterImage } from '../movie/PosterImage';
import type {
  MovieListCollection,
  MovieListMovie,
  ShowListShow,
} from '~/types/List';
import { DiceIcon } from '~/components/list/movie/DiceIcon';

export const RandomTitle = ({
  titles,
}: {
  titles: (MovieListMovie | MovieListCollection)[] | ShowListShow[];
}) => {
  const [selectedIndex, setSelectedIndex] = useState(
    Math.floor(Math.random() * titles.length),
  );
  const selectedItem = titles[selectedIndex];
  const title =
    selectedItem && 'title' in selectedItem
      ? selectedItem?.title
      : selectedItem?.name;

  const roll = () => {
    setSelectedIndex(Math.floor(Math.random() * titles.length));
  };

  return (
    <div className="flex w-full flex-col items-center">
      <div className="prose flex flex-row">
        {selectedIndex && titles[selectedIndex] && (
          <div className="mt-5 flex flex-col items-center justify-center">
            <PosterImage
              alt={title ?? ''}
              url={selectedItem?.posterUrl}
              width={152}
              height={225}
              noMargin
            />
            <h4 className="header mt-3">{title}</h4>
          </div>
        )}
      </div>
      <button className="btn-ghost btn mt-5" onClick={roll}>
        <DiceIcon /> Reroll
      </button>
    </div>
  );
};
