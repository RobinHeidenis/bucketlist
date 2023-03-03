import type { RouterOutputs } from '../../utils/api';
import { ListItem } from './ListItem';
import { Movie } from './Movie';
import { Collection } from './Collection';
import { usePermissionsCheck } from '../../hooks/usePermissionsCheck';
import { useSortedMovieItems } from '../../hooks/useSortedMovieItems';
import { useState } from 'react';
import RenderIfVisible from 'react-render-if-visible';

export const ListItems = ({
  listData,
}: {
  listData: RouterOutputs['lists']['getList'];
}) => {
  const { isOwner, isCollaborator } = usePermissionsCheck(listData);
  const movieItems = useSortedMovieItems(listData);
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

  return (
    <>
      {listData.type === 'MOVIE' && (
        <input
          placeholder="Filter"
          onChange={(e) => setFilterText(e.target.value)}
          className="input-bordered input-ghost input w-52"
        />
      )}
      {listData.type === 'BUCKET' ? (
        listData.items.map((item) => (
          <ListItem
            key={item.id}
            isOwner={isOwner}
            isCollaborator={isCollaborator}
            {...item}
          />
        ))
      ) : (
        <>
          {filteredMovieItems.map((item) => {
            if ('movie' in item) {
              return (
                <RenderIfVisible defaultHeight={144} key={item.id}>
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
                <RenderIfVisible defaultHeight={144} key={item.id}>
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
          )
        </>
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
