import type { BucketListItem as ListItemType } from '@prisma/client';
import { useRef, useState } from 'react';
import { api } from '~/utils/api';
import { DropdownMenu } from '../dropdown/DropdownMenu';
import toast from 'react-hot-toast';
import { ErrorToast } from '../toasts/ErrorToast';
import NiceModal from '@ebay/nice-modal-react';
import { EditItemModal } from '../modals/EditItemModal';
import { type Permissions } from '~/hooks/usePermissionsCheck';
import { showErrorToast } from '~/utils/showErrorToast';
import type { BucketList } from '~/types/List';

export const ListItem = ({
  id,
  checked,
  title,
  description,
  listId,
  permissions,
}: ListItemType & { permissions: Permissions }) => {
  const [showDescription, setShowDescription] = useState(false);
  const context = api.useUtils();
  const ref = useRef<HTMLInputElement>(null);
  const setItemCheckedMutation = api.bucketList.setItemChecked.useMutation({
    onSuccess: () => {
      context.lists.getList.setData({ id: listId }, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          bucketListItems: (prev as BucketList).bucketListItems.map((item) => {
            if (item.id === id) {
              return {
                ...item,
                checked: !item.checked,
              };
            }
            return item;
          }),
        };
      });
      void context.lists.getList.invalidate({ id: listId });
    },
    onError: () => {
      if (!ref.current) return;
      ref.current.checked = !ref.current.checked;
      toast.custom(
        <ErrorToast message="Something went wrong checking or unchecking this item. Please try again later!" />,
      );
    },
  });
  const deleteItemMutation = api.bucketList.deleteItem.useMutation({
    onSuccess: () => {
      context.lists.getList.setData({ id: listId }, (prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          bucketListItems: (prev as BucketList).bucketListItems.filter(
            (item) => item.id !== id,
          ),
        };
      });
      void context.lists.getList.invalidate({ id: listId });
    },
    onError: showErrorToast,
  });
  const openEditItemModal = () => {
    void NiceModal.show(EditItemModal, {
      itemId: id,
      title,
      description,
      listId,
    });
  };

  return (
    <div className="mb-3 flex flex-row justify-between">
      <div className="flex flex-row">
        <input
          ref={ref}
          type="checkbox"
          defaultChecked={checked}
          className={`checkbox mr-3 mt-2 ${
            setItemCheckedMutation.isPending ? 'loading' : ''
          }`}
          onChange={(event) => {
            if (!permissions.hasPermissions) {
              event.preventDefault();
              event.target.checked = checked;
              return;
            }
            setItemCheckedMutation.mutate({
              id,
              listId,
              checked: event.target.checked,
            });
          }}
        />
        <div className="flex flex-col">
          <h3 className={`m-0 ${checked ? 'text-slate-500 line-through' : ''}`}>
            {title}
          </h3>
          <p
            className={`
            m-0 
            ${showDescription ? '' : 'line-clamp-2'} 
            ${checked ? 'text-slate-500 line-through' : ''}
          `}
            onClick={() => void setShowDescription(!showDescription)}
          >
            {description}
          </p>
        </div>
      </div>
      {permissions.hasPermissions && (
        <DropdownMenu
          editOnClick={openEditItemModal}
          deleteOnClick={() => void deleteItemMutation.mutate({ id })}
          isDeleteLoading={deleteItemMutation.isPending}
          className="self-center"
        />
      )}
    </div>
  );
};
