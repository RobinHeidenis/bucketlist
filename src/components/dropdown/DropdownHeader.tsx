import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import type { PropsWithChildren } from 'react';
import type { PropsWithClassName } from '../../types/PropsWithClassName';

export const DropdownHeader = ({
  className,
  children,
}: PropsWithClassName<PropsWithChildren>) => (
  <div className={`dropdown justify-self-end ${className ?? ''}`}>
    <label tabIndex={0} className="btn-ghost btn-xs btn-circle btn m-1">
      <EllipsisVerticalIcon />
    </label>
    <ul
      tabIndex={0}
      className="dropdown-content menu rounded-box w-56 items-start bg-base-100 p-2 shadow"
    >
      {children}
    </ul>
  </div>
);