import { ListItem } from '../ListItem';
import { usePermissionsCheck } from '~/hooks/usePermissionsCheck';
import type { PropsWithBucketList } from '~/types/List';
import { NoItemsMessage } from '~/components/list/NoItemsMessage';

export const BucketListItems = ({ list }: PropsWithBucketList) => {
  const permissions = usePermissionsCheck(list);

  return (
    <>
      {list.bucketListItems.map(
        (item) =>
          typeof item === 'object' && (
            <ListItem key={item.id} permissions={permissions} {...item} />
          ),
      )}
      <NoItemsMessage
        list={list}
        itemName={'items'}
        whereToAddMessage={'Click the button below to add one!'}
        permissions={permissions}
      />
    </>
  );
};
