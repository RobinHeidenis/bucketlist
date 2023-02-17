import type { PropsWithChildren } from 'react';
import Link from 'next/link';

interface ListCardWrapperProps {
  onClick?: () => void;
  href?: string;
}

export const ListCardWrapper = ({
  children,
  onClick,
  href,
}: PropsWithChildren<ListCardWrapperProps>) => (
  <article
    className="card h-52 w-72 transform cursor-pointer bg-base-100 shadow-xl transition duration-300 hover:scale-110"
    onClick={onClick}
  >
    {href ? (
      <Link href={href} className="h-full">
        <div className="card-body h-full">{children}</div>
      </Link>
    ) : (
      <div className="card-body">{children}</div>
    )}
  </article>
);
