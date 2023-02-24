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
        className={`btn-ghost btn-sm btn w-full justify-start gap-2 p-0 ${
          danger ? 'text-error' : ''
        }`}
        onClick={onClick}
      >
        {children}
      </button>
    </li>
  );
};
