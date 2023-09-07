import { DropdownMenu } from '../dropdown/DropdownMenu';
import { api } from '~/utils/api';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { SuccessToast } from '../toasts/SuccessToast';
import NiceModal from '@ebay/nice-modal-react';
import { EditListModal } from '../modals/EditListModal';
import {
  ArrowLeftOnRectangleIcon,
  EyeIcon,
  EyeSlashIcon,
  ListBulletIcon,
  PlusIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { CreateInviteLinkModal } from '../modals/CreateInviteLinkModal';
import { DropdownItem } from '../dropdown/DropdownItem';
import { usePermissionsCheck } from '~/hooks/usePermissionsCheck';
import { FlexRowCenter } from '~/components/style/FlexRowCenter';
import { DropdownHeader } from '~/components/dropdown/DropdownHeader';
import { DiceIcon } from '~/components/list/movie/DiceIcon';
import { RandomItemModal } from '~/components/modals/RandomItemModal';
import {
  type BucketList,
  isBucketList,
  isMovieList,
  type MovieList,
  type MovieListCollection,
  type PropsWithList,
  type ShowList,
} from '~/types/List';
import { showErrorToast } from '~/utils/showErrorToast';

export const ListHeaderMenu = ({ list }: PropsWithList) => {
  const router = useRouter();
  const { id, owner, total, title, description, isPublic, type } = list;
  const { isOwner, isCollaborator } = usePermissionsCheck(list);
  const context = api.useContext();

  const { mutateAsync: deleteList, isLoading: isDeleteListLoading } =
    api.lists.deleteList.useMutation({
      onSuccess: () => {
        toast.custom(<SuccessToast message="List deleted!" />);
        return context.lists.getLists.invalidate();
      },
      onError: showErrorToast,
    });
  const { mutateAsync: togglePublic, isLoading: isTogglePublicLoading } =
    api.lists.setPublic.useMutation({
      onSuccess: () => {
        toast.custom(<SuccessToast message="Visibility updated!" />);
        return context.lists.getList.invalidate({ id });
      },
      onError: showErrorToast,
    });

  const { mutateAsync: leaveList, isLoading: isLeaveListLoading } =
    api.lists.leaveList.useMutation({
      onSuccess: () => {
        toast.custom(<SuccessToast message="Successfully left list!" />);
        return context.lists.getLists.invalidate();
      },
      onError: showErrorToast,
    });

  const showEditListModal = () => {
    void NiceModal.show(EditListModal, { listId: id, title, description });
  };

  const showCreateInviteLinkModal = () => {
    void NiceModal.show(CreateInviteLinkModal, { listId: id });
  };

  return (
    <div className="flex w-full flex-row items-center justify-between">
      <div className="flex flex-col sm:flex-row sm:items-center">
        <FlexRowCenter>
          <UserIcon className="mr-1 h-5 w-5" />
          List by {owner.name}{' '}
          <span className="ml-2 mr-2 hidden sm:block">•</span>
        </FlexRowCenter>
        <FlexRowCenter>
          <ListBulletIcon className="mr-1 h-5 w-5" />
          {'shows' in list ? list.shows.length : total}{' '}
          {type === 'BUCKET'
            ? "to-do's"
            : type === 'MOVIE'
            ? 'movies'
            : 'shows'}
        </FlexRowCenter>
        <span className="ml-3 mr-3 hidden sm:block">•</span>
        <FlexRowCenter>
          {isPublic ? (
            <EyeIcon className="mr-2 h-5 w-5" />
          ) : (
            <EyeSlashIcon className="mr-2 h-5 w-5" />
          )}
          {isPublic ? 'Public' : 'Private'}
        </FlexRowCenter>
      </div>
      {isOwner && (
        <DropdownMenu
          editOnClick={showEditListModal}
          deleteOnClick={() => {
            void deleteList({ id }).then(() => router.push('/lists'));
          }}
          isDeleteLoading={isDeleteListLoading}
        >
          <RandomItemMenuItem list={list} />
          <DropdownItem
            onClick={() => void togglePublic({ id, isPublic: !isPublic })}
          >
            {isPublic ? (
              <EyeSlashIcon
                className={`${isTogglePublicLoading ? 'loading' : ''} h-6 w-6`}
              />
            ) : (
              <EyeIcon
                className={`${isTogglePublicLoading ? 'loading' : ''} h-6 w-6`}
              />
            )}
            Make {isPublic ? 'Private' : 'Public'}
          </DropdownItem>
          <DropdownItem onClick={showCreateInviteLinkModal}>
            <PlusIcon className="h-6 w-6" />
            Invite Collaborators
          </DropdownItem>
        </DropdownMenu>
      )}
      {isCollaborator && (
        <DropdownHeader>
          <RandomItemMenuItem list={list} />
          <DropdownItem
            onClick={() =>
              void leaveList({ id }).then(() => router.push('/lists'))
            }
            danger
          >
            <ArrowLeftOnRectangleIcon
              className={`${isLeaveListLoading ? 'loading' : ''} h-6 w-6`}
            />
            Leave List
          </DropdownItem>
        </DropdownHeader>
      )}
    </div>
  );
};

const RandomItemMenuItem = ({
  list,
}: {
  list: BucketList | MovieList | ShowList;
}) => {
  if (isBucketList(list)) return null;

  const items = isMovieList(list)
    ? [
        ...list.movies.filter((m) => !m.checked),
        // I'm not completely sure why this cast is necessary, but without it the allChecked property doesn't exist.
        ...(list.collections as MovieListCollection[]).filter(
          (c) => !c.allChecked,
        ),
      ]
    : list.shows.filter((s) => !s.allChecked);

  return (
    <DropdownItem
      onClick={() => {
        void NiceModal.show(RandomItemModal, { items });
      }}
    >
      <DiceIcon />
      Random Item
    </DropdownItem>
  );
};
