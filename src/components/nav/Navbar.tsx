import { NavbarLink } from './NavbarLink';
import { signIn, signOut, useSession } from 'next-auth/react';
import Image from 'next/image';

export const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className="navbar sticky top-0 z-50 bg-base-100">
      {session?.user ? (
        <>
          <NavbarLink href="/lists" name="BucketList" />
          <div className="mr-3 hidden sm:inline-flex">
            Hey, {session.user.name}
          </div>
          <div className="dropdown-end dropdown">
            <label tabIndex={0} className="btn-ghost btn-circle avatar btn">
              <div className="w-10 rounded-full">
                <Image
                  src={session.user.image ?? ''}
                  alt="Profile picture"
                  width={80}
                  height={80}
                />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="dropdown-content menu rounded-box menu-compact mt-3 w-52 bg-base-100 p-2 shadow"
            >
              <li className="disabled">
                <a className="justify-between">
                  Profile
                  <span className="badge">New</span>
                </a>
              </li>
              <li className="disabled">
                <a>Settings</a>
              </li>
              <li onClick={() => void signOut()} className="text-error">
                <span>Sign out</span>
              </li>
            </ul>
          </div>
        </>
      ) : (
        <>
          <NavbarLink href="/" name="BucketList" />
          <button
            className="btn-primary btn"
            onClick={() => void signIn('discord', { callbackUrl: '/lists' })}
          >
            Get started
          </button>
        </>
      )}
    </nav>
  );
};
