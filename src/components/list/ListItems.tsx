import type { RouterOutputs } from '../../utils/api';
import { ListItem } from './ListItem';
import { Movie } from './Movie';
import { Collection } from './Collection';
import { usePermissionsCheck } from '../../hooks/usePermissionsCheck';
import { useSortedMovieItems } from '../../hooks/useSortedMovieItems';

export const ListItems = ({
  listData,
}: {
  listData: RouterOutputs['lists']['getList'];
}) => {
  const { isOwner, isCollaborator } = usePermissionsCheck(listData);
  const movieItems = useSortedMovieItems(listData);

  return (
    <>
      {listData.type === 'BUCKET'
        ? listData.items.map((item) => (
            <ListItem
              key={item.id}
              isOwner={isOwner}
              isCollaborator={isCollaborator}
              {...item}
            />
          ))
        : movieItems.map((item) => {
            if ('movie' in item) {
              return (
                <Movie
                  key={item.id}
                  checked={item.checked}
                  itemId={item.id}
                  listId={listData.id}
                  isOwner={isOwner}
                  isCollaborator={isCollaborator}
                  {...item.movie}
                />
              );
            } else {
              return (
                <Collection
                  key={item.id}
                  collection={item}
                  isOwner={isOwner}
                  isCollaborator={isCollaborator}
                  listId={listData.id}
                />
              );
            }
          })}
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
