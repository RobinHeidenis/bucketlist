import { useState } from 'react';
import RenderIfVisible from 'react-render-if-visible';
import { useAutoAnimate } from '@formkit/auto-animate/react';
import type { MovieList } from '~/types/List';
import { isCollection } from '~/types/List';
import { usePermissionsCheck } from '~/hooks/usePermissionsCheck';
import type { sortMap } from '~/hooks/useSortedMovieItems';
import { useSortedMovieItems } from '~/hooks/useSortedMovieItems';
import { RandomTitle } from '../RandomTitle';
import { Movie } from '../Movie';
import { Collection } from '../Collection';

export const MovieListItems = ({ list }: { list: MovieList }) => {
  const { isOwner, isCollaborator } = usePermissionsCheck(list);
  const [filterMode, setFilterMode] = useState<keyof typeof sortMap>('default');
  const movieItems = useSortedMovieItems(list, filterMode);
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
        <RandomTitle titles={list.movies.filter((movie) => !movie.checked)} />
        <input
          placeholder="Filter"
          onChange={(e) => setFilterText(e.target.value)}
          className="input-bordered input-ghost input w-52"
        />
      </div>
      <div ref={parent}>
        {filteredMovieItems.map((item) => {
          if (isCollection(item)) {
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
                  listId={list.id}
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
