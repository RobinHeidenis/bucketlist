import { useUser } from '@clerk/nextjs';
import { useEffect } from 'react';
import { setUser } from '@sentry/nextjs';

export const SentryUserManager = () => {
  const { user } = useUser();

  useEffect(() => {
    if (user) {
      console.log(user);
      setUser({
        id: user.id,
        username: `${user.firstName ?? ''}${
          user.lastName ? ` ${user.lastName}` : ''
        }`,
        email: user.emailAddresses[0]?.emailAddress,
      });
    }
  }, [user]);

  return null;
};
