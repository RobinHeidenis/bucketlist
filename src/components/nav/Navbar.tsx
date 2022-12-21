import { NavbarLink } from "./NavbarLink";
import { signIn, signOut, useSession } from "next-auth/react";
import Image from "next/image";

export const Navbar = () => {
  const { data: session } = useSession();

  return (
    <nav className={"navbar bg-base-100"}>
      <NavbarLink href={"/"} name={"BucketList"} />
      {session?.user ? (
        <>
          <div className={"mr-3"}>
            Hey, {session.user.name}
          </div>
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <Image src={session.user.image ?? ""} alt={"Profile picture"} width={80} height={80} />
              </div>
            </label>
            <ul tabIndex={0}
                className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
              <li className={"disabled"}>
                <a className="justify-between">
                  Profile
                  <span className="badge">New</span>
                </a>
              </li>
              <li className={"disabled"}><a>Settings</a></li>
              <li onClick={() => signOut()} className={"text-error"}><span>Sign out</span></li>
            </ul>
          </div>
        </>
      ) : (
        <button className={"btn btn-primary"} onClick={() => signIn()}>Get started</button>
      )}
    </nav>
  );
};