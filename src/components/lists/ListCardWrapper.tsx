import type { PropsWithChildren } from 'react';

interface ListCardWrapperProps {
  onClick?: () => void;
}

export const ListCardWrapper = ({
  children,
  onClick,
}: PropsWithChildren<ListCardWrapperProps>) => (
  <article
    className="card h-52 w-72 transform cursor-pointer bg-base-100 shadow-xl transition duration-300 hover:scale-110"
    onClick={onClick}
  >
    <div className="card-body">{children}</div>
  </article>
);
