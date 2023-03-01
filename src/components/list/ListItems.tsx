import type { RouterOutputs } from '../../utils/api';
import { Fragment, useMemo } from 'react';
import { ListItem } from './ListItem';
import { useSession } from 'next-auth/react';
import { Movie } from './Movie';
import { Collection } from './Collection';

export const ListItems = ({
  listData,
}: {
  listData: RouterOutputs['lists']['getList'];
}) => {
  const { data } = useSession();
  const isOwner = data?.user?.id === listData.owner.id;
  const isCollaborator = useMemo(() => {
    if (!listData) return false;
    return listData.collaborators.some(
      (collaborator) => collaborator.id === data?.user?.id,
    );
  }, [listData, data?.user?.id]);

  const collections = useMemo(() => {
    const collections = Object.values(listData.collections).sort((a, b) => {
      console.info(a, b);
      if (a.title < b.title) return -1;
      if (a.title > b.title) return 1;
      return 0;
    });
    return collections.map((collection) => {
      collection.items = collection.items.sort((a, b) => {
        if (a.movie.title < b.movie.title) return -1;
        if (a.movie.title > b.movie.title) return 1;
        return 0;
      });
      const allChecked = collection.items.every((item) => item.checked);
      return { ...collection, allChecked };
    });
  }, [listData.collections]);

  const movieItems = useMemo(() => {
    return [...listData.movieItems, ...collections].sort((a, b) => {
      let aTitle;
      if ('movie' in a) {
        aTitle = a.movie.title;
      } else {
        aTitle = a.title;
      }

      let bTitle;
      if ('movie' in b) {
        bTitle = b.movie.title;
      } else {
        bTitle = b.title;
      }

      if (aTitle < bTitle) return -1;
      if (aTitle > bTitle) return 1;
      return 0;
    });
  }, [listData.movieItems, collections]);

  return (
    <>
      {listData.type === 'BUCKET'
        ? listData.items.map((item) => (
            <Fragment key={item.id}>
              <ListItem
                isOwner={isOwner}
                isCollaborator={isCollaborator}
                {...item}
              />
            </Fragment>
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
