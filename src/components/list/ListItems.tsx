import type { RouterOutputs } from '../../utils/api';
import { Fragment, useMemo } from 'react';
import { ListItem } from './ListItem';
import { useSession } from 'next-auth/react';
import { Movie } from './Movie';

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

  return (
    <>
      {listData.items.map((item) => (
        <Fragment key={item.id}>
          {listData.type === 'MOVIE' && item.movie && (
            <Movie
              checked={item.checked}
              itemId={item.id}
              listId={listData.id}
              isOwner={isOwner}
              isCollaborator={isCollaborator}
              {...item.movie}
            />
          )}
          {listData.type === 'BUCKET' && (
            <ListItem
              isOwner={isOwner}
              isCollaborator={isCollaborator}
              {...item}
            />
          )}
        </Fragment>
      ))}
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
