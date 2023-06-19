import { NavbarLink } from './NavbarLink';
import { UserButton, useUser } from '@clerk/nextjs';

export const Navbar = () => {
  const { isSignedIn, user } = useUser();

  return (
    <nav className="navbar sticky top-0 z-50 bg-base-100">
      {isSignedIn && user ? (
        <>
          <NavbarLink href="/lists" name="BucketList" />
          <div className="mr-3 hidden sm:inline-flex">
            Hey, {user.fullName ?? user.firstName}
          </div>
          <div className="dropdown-end dropdown">
            <UserButton afterSignOutUrl="/" />
          </div>
        </>
      ) : (
        <>
          <NavbarLink href="/" name="BucketList" />
          <a href="/sign-in" className="btn-primary btn">
            Get started
          </a>
        </>
      )}
    </nav>
  );
};
