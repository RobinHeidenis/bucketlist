import { useState } from 'react';
import RenderIfVisible from 'react-render-if-visible';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import type { MovieList } from '~/types/List';
import { isCollection } from '~/types/List';
import { usePermissionsCheck } from '~/hooks/usePermissionsCheck';
import type { sortMap } from '~/hooks/useSortedMovieItems';
import { useSortedMovieItems } from '~/hooks/useSortedMovieItems';
import { RandomTitle } from '../RandomTitle';
import { Movie } from './Movie';
import { Collection } from './Collection';
import { CustomDropdown } from '~/components/dropdown/CustomDropdown';
import {
  ArrowsUpDownIcon,
  CalendarDaysIcon,
  EyeIcon,
  EyeSlashIcon,
  FunnelIcon,
} from '@heroicons/react/24/outline';
import { TIcon } from '~/components/list/movie/TIcon';
import { StarIcon } from '@heroicons/react/24/solid';

const filterModeOptions = [
  {
    value: 'default',
    label: 'Default',
    icon: <ArrowsUpDownIcon className={'h-6 w-6'} />,
  },
  {
    value: 'seen',
    label: 'Seen',
    icon: <EyeIcon className={'h-6 w-6'} />,
  },
  {
    value: 'notSeen',
    label: 'Not seen',
    icon: <EyeSlashIcon className={'h-6 w-6'} />,
  },
  {
    value: 'alphabetically',
    label: 'Title (A-Z)',
    icon: <TIcon />,
  },
  { value: 'alphabeticallyReverse', label: 'Title (Z-A)', icon: <TIcon /> },
  {
    value: 'releaseDate',
    label: 'Release Date (newest)',
    icon: <CalendarDaysIcon className={'h-6 w-6'} />,
  },
  {
    value: 'releaseDateReverse',
    label: 'Release Date (oldest)',
    icon: <CalendarDaysIcon className={'h-6 w-6'} />,
  },
  {
    value: 'rating',
    label: 'Ratings (highest)',
    icon: <StarIcon className={'h-6 w-6'} />,
  },
  {
    value: 'ratingReverse',
    label: 'Ratings (lowest)',
    icon: <StarIcon className={'h-6 w-6'} />,
  },
];

export const MovieListItems = ({ list }: { list: MovieList }) => {
  const { isOwner, isCollaborator } = usePermissionsCheck(list);
  const [filterMode, setFilterMode] = useState<string>('default');
  const movieItems = useSortedMovieItems(
    list,
    filterMode as keyof typeof sortMap,
  );
  const [filterText, setFilterText] = useState('');
  const filteredMovieItems = !filterText
    ? movieItems
    : movieItems.filter((item) => {
        if (isCollection(item)) {
          return item.name.toLowerCase().includes(filterText.toLowerCase());
        } else {
          return item.title.toLowerCase().includes(filterText.toLowerCase());
        }
      });
  const [parent] = useAutoAnimate();

  return (
    <>
      <div className="mb-5 mt-2 flex items-start justify-between">
        <CustomDropdown
          items={filterModeOptions}
          label={
            <div className={'flex flex-row items-center justify-start'}>
              <ArrowsUpDownIcon className={'mr-2 h-6 w-6'} />
              <span className={'text-start'}>
                {filterMode === 'default'
                  ? 'Sort'
                  : filterModeOptions.find((i) => i.value === filterMode)
                      ?.label ?? ''}
              </span>
            </div>
          }
          selected={filterMode}
          setSelected={setFilterMode}
          justifyStart
        />
        <RandomTitle titles={list.movies.filter((movie) => !movie.checked)} />
        <div className={'input-group flex items-center justify-end'}>
          <FunnelIcon className={'h-6 w-6'} />
          <input
            placeholder="Filter"
            onChange={(e) => setFilterText(e.target.value)}
            className="input-ghost input w-48"
          />
        </div>
      </div>
      <div ref={parent}>
        {filteredMovieItems.map((item) => {
          if (isCollection(item)) {
            return (
              <RenderIfVisible defaultHeight={144} key={item.id}>
                <Collection
                  collection={item}
                  isOwner={isOwner}
                  isCollaborator={isCollaborator}
                  listId={list.id}
                />
              </RenderIfVisible>
            );
          } else {
            return (
              <RenderIfVisible defaultHeight={144} key={item.id}>
                <Movie
                  listId={list.id}
                  isOwner={isOwner}
                  isCollaborator={isCollaborator}
                  movie={item}
                />
              </RenderIfVisible>
            );
          }
        })}
      </div>
      {filteredMovieItems.length === 0 && <h3>No items found</h3>}
      {list.total === 0 && (
        <>
          {isOwner ? (
            <>
              <h3 className="m-0">
                Oh no! You don&apos;t have any movies on this list
              </h3>
              <h4 className="m-0">
                Go find some movies in the search bar above!
              </h4>
            </>
          ) : (
            <h3 className="m-0">Oh no! This list is empty :(</h3>
          )}
        </>
      )}
    </>
  );
};
