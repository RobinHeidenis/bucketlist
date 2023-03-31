import { ListItem } from '../ListItem';
import { usePermissionsCheck } from '../../../hooks/usePermissionsCheck';
import type { BucketList } from '../../../types/List';

export const BucketListItems = ({ list }: { list: BucketList }) => {
  const { isOwner, isCollaborator } = usePermissionsCheck(list);

  return (
    <>
      {list.bucketListItems.map(
        (item) =>
          typeof item === 'object' && (
            <ListItem
              key={item.id}
              isOwner={isOwner}
              isCollaborator={isCollaborator}
              {...item}
            />
          ),
      )}
      {list.total === 0 && (
        <>
          {isOwner ? (
            <>
              <h3 className="m-0">
                Oh no! You don&apos;t have any items on this list :(
              </h3>
              <h4 className="m-0">Click the button below to add one!</h4>
            </>
          ) : (
            <h3 className="m-0">Oh no! This list is empty :(</h3>
          )}
        </>
      )}
    </>
  );
};
