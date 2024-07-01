import { EllipsisVerticalIcon } from '@heroicons/react/24/outline';
import type { PropsWithChildren } from 'react';
import type { PropsWithClassName } from '~/types/PropsWithClassName';

export const DropdownHeader = ({
  className,
  children,
}: PropsWithClassName<PropsWithChildren>) => (
  <div
    className={`dropdown justify-self-end ${
      className ?? ''
    } dropdown-left z-50`}
    onClick={(e) => void e.stopPropagation()}
  >
    <label tabIndex={0} className="btn btn-circle btn-ghost btn-xs m-1">
      <EllipsisVerticalIcon />
    </label>
    <ul
      tabIndex={0}
      className="menu dropdown-content z-50 w-56 items-start rounded-box bg-base-100 p-2 shadow"
    >
      {children}
    </ul>
  </div>
);
