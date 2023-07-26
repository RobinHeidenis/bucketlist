import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { isPast } from 'date-fns';
import { api } from '~/utils/api';
import { ModalHeader } from './ModalHeader';
import { InviteLinkRow } from '../inviteLinks/InviteLinkRow';
import { showErrorToast } from '~/utils/showErrorToast';

interface CreateInviteLinkModalProps {
  listId: string;
}

export const CreateInviteLinkModal = NiceModal.create(
  ({ listId }: CreateInviteLinkModalProps) => {
    const modal = useModal();
    const utils = api.useContext();
    const { mutate, isLoading } = api.invite.create.useMutation({
      onSuccess: () => {
        void utils.invite.getInvitesByListId.invalidate({ id: listId });
      },
      onError: showErrorToast,
    });
    const { data: invites } = api.invite.getInvitesByListId.useQuery({
      id: listId,
    });

    const filteredInvites = invites?.filter(
      (invite) => !isPast(invite.expiresAt),
    );

    return (
      <ModalHeader title="Create invite link" modal={modal}>
        <div>
          {filteredInvites && filteredInvites.length > 0 && (
            <table className="mt-5 table table-fixed">
              <thead>
                <tr>
                  <th>Link</th>
                  <th>Expires</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filteredInvites.map((invite) => (
                  <InviteLinkRow invite={invite} key={invite.id} />
                ))}
              </tbody>
            </table>
          )}
        </div>
        <button
          className={`btn-primary btn mt-5 ${
            filteredInvites && filteredInvites.length > 0
              ? 'self-end'
              : 'self-center'
          } ${isLoading ? 'loading' : ''}`}
          type="button"
          onClick={() => mutate({ listId })}
        >
          Create link
        </button>
      </ModalHeader>
    );
  },
);
