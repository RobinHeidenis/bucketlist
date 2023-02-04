import type { List, ListItem, User } from '@prisma/client';
import { DropdownMenu } from './DropdownMenu';
import { api } from '../../utils/api';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { ErrorToast } from '../toasts/ErrorToast';
import { SuccessToast } from '../toasts/SuccessToast';
import NiceModal from "@ebay/nice-modal-react";
import { EditListModal } from "../modals/EditListModal";

export const ListHeaderMenu = ({
  id,
  owner,
  items,
  title,
  description,
}: List & { owner: User; items: ListItem[] }) => {
  const router = useRouter();
  const context = api.useContext();
  const { mutateAsync: deleteList } = api.lists.deleteList.useMutation({
    onSuccess: () => {
      toast.custom(<SuccessToast message="List deleted!" />);
      return context.lists.getLists.invalidate();
    },
    onError: ({ message }) => {
      toast.custom(<ErrorToast message={message} />);
    },
  });

  const showEditListModal = () => {
    void NiceModal.show(EditListModal, { id, title, description })
  }

  return (
    <div className="flex w-full flex-row items-center justify-between">
      <p className="m-0">
        List by {owner.name} • {items.length} to-do&apos;s
      </p>
      <DropdownMenu
        editOnClick={() => showEditListModal()}
        deleteOnClick={() => {
          void deleteList({ id }).then(() => router.push('/lists'));
        }}
      />
    </div>
  );
};
