import type { List, ListItem, User } from "@prisma/client";
import { DropdownMenu } from "./DropdownMenu";
import { api } from "../../utils/api";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { ErrorToast } from "../toasts/ErrorToast";
import { SuccessToast } from "../toasts/SuccessToast";
import NiceModal from "@ebay/nice-modal-react";
import { EditListModal } from "../modals/EditListModal";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useSession } from "next-auth/react";

export const ListHeaderMenu = ({
  id,
  owner,
  items,
  title,
  description,
  isPublic,
}: List & { owner: User; items: ListItem[], collaborators: User[] }) => {
  const router = useRouter();
  const { data } = useSession();
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
  const isOwner = data?.user?.id === owner.id;
  const showEditListModal = () => {
    void NiceModal.show(EditListModal, { id, title, description });
  };

  return (
    <div className="flex w-full flex-row items-center justify-between">
      <div className="flex flex-row items-center">
        <p className="m-0">
          List by {owner.name} • {items.length} to-do&apos;s
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
          editOnClick={() => showEditListModal()}
          deleteOnClick={() => {
            void deleteList({ id }).then(() => router.push('/lists'));
          }}
        >
          <li className="w-full">
            <button
              className="btn-ghost btn-sm btn w-full justify-start gap-2 p-0"
              onClick={() => void togglePublic({ id, isPublic: !isPublic })}
            >
              {isPublic ? (
                <EyeSlashIcon className="h-6 w-6" />
              ) : (
                <EyeIcon className="h-6 w-6" />
              )}
              Make {isPublic ? 'Private' : 'Public'}
            </button>
          </li>
        </DropdownMenu>
      )}
    </div>
  );
};
