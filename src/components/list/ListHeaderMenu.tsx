import { DropdownMenu } from '../dropdown/DropdownMenu';
import type { RouterOutputs } from '~/utils/api';
import { api } from '~/utils/api';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { ErrorToast } from '../toasts/ErrorToast';
import { SuccessToast } from '../toasts/SuccessToast';
import NiceModal from '@ebay/nice-modal-react';
import { EditListModal } from '../modals/EditListModal';
import { EyeIcon, EyeSlashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { CreateInviteLinkModal } from '../modals/CreateInviteLinkModal';
import { DropdownItem } from '../dropdown/DropdownItem';
import { usePermissionsCheck } from '~/hooks/usePermissionsCheck';

export const ListHeaderMenu = ({
  listData,
}: {
  listData: RouterOutputs['lists']['getList'];
}) => {
  const router = useRouter();
  const { id, owner, total, title, description, isPublic, type } = listData;
  const { isOwner } = usePermissionsCheck(listData);
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
  const { mutateAsync: togglePublic } = api.lists.setPublic.useMutation({
    onSuccess: () => {
      toast.custom(<SuccessToast message="Visibility updated!" />);
      return context.lists.getList.invalidate({ id });
    },
    onError: ({ message }) => {
      toast.custom(<ErrorToast message={message} />);
    },
  });

  const showEditListModal = () => {
    void NiceModal.show(EditListModal, { listId: id, title, description });
  };

  const showCreateInviteLinkModal = () => {
    void NiceModal.show(CreateInviteLinkModal, { listId: id });
  };

  return (
    <div className="flex w-full flex-row items-center justify-between">
      <div className="flex flex-row items-center">
        <p className="m-0">
          List by {owner.name} • {total}{' '}
          {type === 'BUCKET' ? "to-do's" : 'movies'}
        </p>
        <span className="ml-3 mr-3">•</span>
        <div className="tooltip" data-tip={isPublic ? 'Public' : 'Private'}>
          {isPublic ? (
            <EyeIcon className="h-5 w-5" />
          ) : (
            <EyeSlashIcon className="h-5 w-5" />
          )}
        </div>
      </div>
      {isOwner && (
        <DropdownMenu
          editOnClick={showEditListModal}
          deleteOnClick={() => {
            void deleteList({ id }).then(() => router.push('/lists'));
          }}
        >
          <DropdownItem
            onClick={() => void togglePublic({ id, isPublic: !isPublic })}
          >
            {isPublic ? (
              <EyeSlashIcon className="h-6 w-6" />
            ) : (
              <EyeIcon className="h-6 w-6" />
            )}
            Make {isPublic ? 'Private' : 'Public'}
          </DropdownItem>
          <DropdownItem onClick={showCreateInviteLinkModal}>
            <PlusIcon className="h-6 w-6" />
            Invite Collaborators
          </DropdownItem>
        </DropdownMenu>
      )}
    </div>
  );
};
