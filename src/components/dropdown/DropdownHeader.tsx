import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import type { PropsWithChildren } from 'react';
import type { PropsWithClassName } from '~/types/PropsWithClassName';

export const DropdownHeader = ({
  className,
  left,
  children,
}: PropsWithClassName<PropsWithChildren<{ left?: boolean }>>) => (
  <div
    className={`dropdown justify-self-end ${className ?? ''} ${
      left ? 'dropdown-left' : ''
    }`}
    onClick={(e) => e.stopPropagation()}
  >
    <label tabIndex={0} className="btn-ghost btn-xs btn-circle btn m-1">
      <EllipsisVerticalIcon />
    </label>
    <ul
      tabIndex={0}
      className="dropdown-content menu rounded-box z-50 w-56 items-start bg-base-100 p-2 shadow"
    >
      {children}
    </ul>
  </div>
);
