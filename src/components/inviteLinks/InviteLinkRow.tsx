import { formatDistance } from 'date-fns';
import { ClipboardIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useClipboard } from '@mantine/hooks';
import { api } from '~/utils/api';
import type { InviteLink } from '@prisma/client';
import toast from 'react-hot-toast';
import { SuccessToast } from '../toasts/SuccessToast';

interface InviteLinkRowProps {
  invite: InviteLink & { url: string };
}

export const InviteLinkRow = ({ invite }: InviteLinkRowProps) => {
  const utils = api.useContext();
  const { mutate: deleteInvite, isLoading: deleteInviteLoading } =
    api.invite.deleteInvite.useMutation({
      onSuccess: () => {
        void utils.invite.getInvitesByListId.invalidate({
          id: invite.listId,
        });
        toast.custom(<SuccessToast message="Invite link deleted!" />);
      },
    });
  const clipboard = useClipboard();

  return (
    <tr key={invite.id}>
      <td>
        <div className="flex flex-row items-center justify-between">
          <a href={invite.url} target="_blank" rel="noreferrer">
            {invite.url}
          </a>
          <div
            className={`tooltip tooltip-bottom ${
              clipboard.copied ? 'open' : ''
            }`}
            data-tip={`${clipboard.copied ? 'Copied!' : 'Copy to clipboard'}`}
          >
            <ClipboardIcon
              onClick={() => clipboard.copy(invite.url)}
              className="ml-2 h-5 w-5 cursor-pointer"
            />
          </div>
        </div>
      </td>
      <td>
        {formatDistance(new Date(invite.expiresAt), new Date(), {
          addSuffix: true,
        })}
      </td>
      <td>
        <div className="tooltip tooltip-top" data-tip="Delete invite">
          <button
            className={`btn-ghost btn-sm btn ${
              deleteInviteLoading ? 'loading' : ''
            }`}
            disabled={deleteInviteLoading}
            onClick={() => deleteInvite({ id: invite.id })}
          >
            {!deleteInviteLoading && (
              <TrashIcon className="h-5 w-5 cursor-pointer text-error" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
};
