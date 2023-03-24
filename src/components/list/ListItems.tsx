import type { RouterOutputs } from '../../utils/api';
import { ListItem } from './ListItem';
import { Movie } from './Movie';
import { Collection } from './Collection';
import { usePermissionsCheck } from '../../hooks/usePermissionsCheck';
import type { sortMap } from '../../hooks/useSortedMovieItems';
import { useSortedMovieItems } from '../../hooks/useSortedMovieItems';
import { useState } from 'react';
import RenderIfVisible from 'react-render-if-visible';
import { RandomTitle } from './RandomTitle';
import type {
  ListItem as ListItemType,
  Movie as MovieType,
} from '@prisma/client';
import { useAutoAnimate } from '@formkit/auto-animate/react';

export const ListItems = ({
  listData,
}: {
  listData: RouterOutputs['lists']['getList'];
}) => {
  const { isOwner, isCollaborator } = usePermissionsCheck(listData);
  const [filterMode, setFilterMode] = useState<keyof typeof sortMap>('default');
  const movieItems = useSortedMovieItems(listData, filterMode);
  const [filterText, setFilterText] = useState('');
  const filteredMovieItems = !filterText
    ? movieItems
    : movieItems.filter((item) => {
        if ('movie' in item) {
          return item.movie.title
            .toLowerCase()
            .includes(filterText.toLowerCase());
        } else {
          return item.title.toLowerCase().includes(filterText.toLowerCase());
        }
      });
  const [parent] = useAutoAnimate();

  return (
    <>
      {listData.type === 'MOVIE' && (
        <div className="mt-2 mb-5 flex items-start justify-between">
          <label className="input-group">
            <select
              className="select-ghost select max-w-xs"
              onChange={(e) =>
                setFilterMode(e.target.value as keyof typeof sortMap)
              }
            >
              <option disabled selected>
                Sort
              </option>
              <option value="default">Default</option>
              <option value="seen">Seen</option>
              <option value="notSeen">Not seen</option>
              <option value="alphabetically">Title (A-Z)</option>
              <option value="alphabeticallyReverse">Title (Z-A)</option>
              <option value="releaseDate">Release Date (newest)</option>
              <option value="releaseDateReverse">Release Date (oldest)</option>
              <option value="rating">Ratings (highest)</option>
              <option value="ratingReverse">Ratings (lowest)</option>
            </select>
          </label>
          <RandomTitle
            titles={(
              listData.items as (ListItemType & { movie: MovieType })[]
            ).filter((item) => !item.checked)}
          />
          <input
            placeholder="Filter"
            onChange={(e) => setFilterText(e.target.value)}
            className="input-bordered input-ghost input w-52"
          />
        </div>
      )}
      {listData.type === 'BUCKET' ? (
        listData.items.map(
          (item) =>
            typeof item === 'object' && (
              <ListItem
                key={item.id}
                isOwner={isOwner}
                isCollaborator={isCollaborator}
                {...item}
              />
            ),
        )
      ) : (
        <div ref={parent}>
          {filteredMovieItems.map((item) => {
            if ('movie' in item) {
              return (
                <RenderIfVisible
                  defaultHeight={144}
                  key={item.id}
                  stayRendered={!filterText && filterMode === 'default'}
                >
                  <Movie
                    checked={item.checked}
                    itemId={item.id}
                    listId={listData.id}
                    isOwner={isOwner}
                    isCollaborator={isCollaborator}
                    {...item.movie}
                  />
                </RenderIfVisible>
              );
            } else {
              return (
                <RenderIfVisible
                  defaultHeight={144}
                  key={item.id}
                  stayRendered={!filterText && filterMode === 'default'}
                >
                  <Collection
                    collection={item}
                    isOwner={isOwner}
                    isCollaborator={isCollaborator}
                    listId={listData.id}
                  />
                </RenderIfVisible>
              );
            }
          })}
        </div>
      )}
      {listData.type === 'MOVIE' && filteredMovieItems.length === 0 && (
        <h3>No items found</h3>
      )}
      {listData.items.length === 0 && (
        <>
          {isOwner ? (
            <>
              <h3 className="m-0">
                Oh no! You don&apos;t have any{' '}
                {listData.type === 'BUCKET' ? 'items' : 'movies'} on this list
                :(
              </h3>
              <h4 className="m-0">
                {listData.type === 'BUCKET'
                  ? 'Click the button below to add one!'
                  : 'Go find some movies in the search bar above!'}
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
