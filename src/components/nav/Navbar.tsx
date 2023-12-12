import { NavbarLink } from './NavbarLink';
import { UserButton, useUser } from '@clerk/nextjs';

export const Navbar = () => {
  const { isSignedIn, user } = useUser();

  return (
    <nav className="navbar sticky top-0 z-60 bg-base-100">
      {isSignedIn ? (
        <>
          <NavbarLink href="/lists" name="BucketList" />
          <div className="mr-3 hidden sm:inline-flex">
            Hey, {user.fullName ?? user.firstName}
          </div>
          <div className="dropdown dropdown-end">
            <UserButton afterSignOutUrl="/" />
          </div>
        </>
      ) : (
        <>
          <NavbarLink href="/" name="BucketList" />
          <a href="/sign-in" className="btn btn-primary">
            Get started
          </a>
        </>
      )}
    </nav>
  );
};
