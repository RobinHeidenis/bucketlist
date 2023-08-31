import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import type { PropsWithClassName } from '~/types/PropsWithClassName';
import type { PropsWithChildren } from 'react';
import { DropdownItem } from './DropdownItem';
import { DropdownHeader } from './DropdownHeader';

interface DropdownMenuProps {
  editOnClick: () => void;
  deleteOnClick: () => void;
  isDeleteLoading?: boolean;
}

export const DropdownMenu = ({
  editOnClick,
  deleteOnClick,
  isDeleteLoading,
  className,
  children,
}: PropsWithChildren<PropsWithClassName<DropdownMenuProps>>) => {
  return (
    <DropdownHeader className={className}>
      <DropdownItem onClick={editOnClick}>
        <PencilIcon className="h-6 w-6" />
        Edit
      </DropdownItem>
      {children}
      <DropdownItem onClick={deleteOnClick} danger>
        <TrashIcon className={`${isDeleteLoading ? 'loading' : ''} h-6 w-6`} />
        Delete
      </DropdownItem>
    </DropdownHeader>
  );
};
