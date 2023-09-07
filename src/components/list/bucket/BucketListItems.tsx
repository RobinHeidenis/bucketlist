import { ListItem } from '../ListItem';
import { usePermissionsCheck } from '~/hooks/usePermissionsCheck';
import type { PropsWithBucketList } from '~/types/List';
import { NoItemsMessage } from '~/components/list/NoItemsMessage';
import NiceModal from '@ebay/nice-modal-react';
import { CreateItemModal } from '~/components/modals/CreateItemModal';

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
      {permissions.hasPermissions && (
        <div
          className={`mb-10 flex w-full flex-row ${
            list.total === 0 ? 'justify-start' : 'mt-10 justify-end'
          }`}
        >
          <button
            className={`btn btn-primary ${list.total === 0 ? 'mt-5' : ''}`}
            onClick={() =>
              void NiceModal.show(CreateItemModal, { listId: list.id })
            }
          >
            Add to-do
          </button>
        </div>
      )}
    </>
  );
};
