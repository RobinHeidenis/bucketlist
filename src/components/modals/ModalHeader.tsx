import type { PropsWithChildren } from 'react';
import { useClickOutside } from '@mantine/hooks';
import type { NiceModalHandler } from '@ebay/nice-modal-react';

interface ModalHeaderProps {
  title: string;
  modal: NiceModalHandler;
}

export const ModalHeader = ({
  title,
  modal,
  children,
}: PropsWithChildren<ModalHeaderProps>) => {
  const ref = useClickOutside(() => void modal.remove());

  return (
    <div className={`modal ${modal.visible ? 'modal-open' : ''}`}>
      <div
        className="modal-box relative max-w-2xl p-0 pb-6 pt-6 xsm:p-6"
        ref={ref}
      >
        <label
          className="btn-sm btn-circle btn absolute right-2 top-2"
          onClick={() => void modal.remove()}
        >
          ✕
        </label>
        <div className="flex flex-col items-center">
          <h3 className="text-lg font-bold">{title}</h3>
          {children}
        </div>
      </div>
    </div>
  );
};
