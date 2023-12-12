import Link from 'next/link';

interface NavbarLinkProps {
  href: string;
  name: string;
}

export const NavbarLink = ({ href, name }: NavbarLinkProps) => (
  <div className="flex-1">
    <Link href={href} className="btn btn-ghost text-xl normal-case">
      {name}
    </Link>
  </div>
);
