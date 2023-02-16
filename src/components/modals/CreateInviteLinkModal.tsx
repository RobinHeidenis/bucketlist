import NiceModal, { useModal } from '@ebay/nice-modal-react';
import { formatDistance, isPast } from 'date-fns';
import { api } from '../../utils/api';
import { ModalHeader } from './ModalHeader';
import { ClipboardIcon } from '@heroicons/react/24/outline';
import { useClipboard } from '@mantine/hooks';

interface CreateInviteLinkModalProps {
  listId: string;
}

export const CreateInviteLinkModal = NiceModal.create(
  ({ listId }: CreateInviteLinkModalProps) => {
    const modal = useModal();
    const utils = api.useContext();
    const clipboard = useClipboard();
    const { mutate, isLoading } = api.invite.create.useMutation({
      onSuccess: () => {
        void utils.invite.getInvitesByListId.invalidate({ id: listId });
      },
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
            <table className="table table-fixed">
              <thead>
                <tr>
                  <th>Link</th>
                  <th>Expires</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvites.map((invite) => (
                  <tr key={invite.id}>
                    <td className="flex flex-row items-center">
                      <a href={invite.url} target="_blank" rel="noreferrer">
                        {invite.url}
                      </a>
                      <div
                        className={`tooltip tooltip-bottom ${
                          clipboard.copied ? 'open' : ''
                        }`}
                        data-tip={`${
                          clipboard.copied ? 'Copied!' : 'Copy to clipboard'
                        }`}
                      >
                        <ClipboardIcon
                          onClick={() => clipboard.copy(invite.url)}
                          className="ml-2 h-5 w-5 cursor-pointer"
                        />
                      </div>
                    </td>
                    <td>
                      {formatDistance(new Date(invite.expiresAt), new Date(), {
                        addSuffix: true,
                      })}
                    </td>
                  </tr>
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
