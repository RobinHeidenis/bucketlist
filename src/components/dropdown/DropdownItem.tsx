import type { PropsWithChildren } from 'react';

export const DropdownItem = ({
  children,
  danger,
  onClick,
}: PropsWithChildren<{
  onClick: () => void;
  danger?: boolean;
}>) => {
  return (
    <li className="w-full">
      <button
        className={`btn btn-ghost btn-sm w-full justify-start p-0 ${
          danger ? 'text-error' : ''
        }`}
        onClick={onClick}
      >
        {children}
      </button>
    </li>
  );
};
