import {
  EllipsisVerticalIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import type { PropsWithClassName } from '../../types/PropsWithClassName';

interface DropdownMenuProps {
  editOnClick: () => void;
  deleteOnClick: () => void;
}

export const DropdownMenu = ({
  editOnClick,
  deleteOnClick,
  className,
}: PropsWithClassName<DropdownMenuProps>) => {
  return (
    <div className={`dropdown justify-self-end ${className ?? ''}`}>
      <label tabIndex={0} className="btn-ghost btn-xs btn-circle btn m-1">
        <EllipsisVerticalIcon />
      </label>
      <ul
        tabIndex={0}
        className="dropdown-content menu rounded-box w-32 items-start bg-base-100 p-2 shadow"
      >
        <li className="w-full">
          <button
            className="btn-ghost btn-sm btn w-full justify-start gap-2 p-0"
            onClick={editOnClick}
          >
            <PencilIcon className="h-6 w-6" />
            Edit
          </button>
        </li>
        <li className="w-full">
          <button
            className="btn-ghost btn-sm btn w-full justify-start gap-2 p-0 text-error"
            onClick={deleteOnClick}
          >
            <TrashIcon className="h-6 w-6" />
            Delete
          </button>
        </li>
      </ul>
    </div>
  );
};
