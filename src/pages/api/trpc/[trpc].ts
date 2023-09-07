import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';
import {
  captureException,
  setUser,
  type User,
  wrapApiHandlerWithSentry,
} from '@sentry/nextjs';
import { env } from '~/env.mjs';
import { getAuth } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs';

// export API handler
export default wrapApiHandlerWithSentry(
  createNextApiHandler({
    router: appRouter,
    createContext: createTRPCContext,
    // eslint-disable-next-line @typescript-eslint/no-misused-promises
    onError: async ({ error, path, req }) => {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        const auth = getAuth(req, {});
        if (auth.userId) {
          const clerkUser = await clerkClient.users.getUser(auth.userId);
          const sentryUser = {
            id: auth.userId,
            username: `${clerkUser.firstName ?? ''}${
              clerkUser.lastName ? ` ${clerkUser.lastName}` : ''
            }`,
            email: clerkUser.emailAddresses[0]?.emailAddress,
          } satisfies User;
          setUser(sentryUser);
        }
        captureException(error);
      }

      if (env.NODE_ENV === 'development') {
        console.error(
          `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
        );
      }
    },
  }),
  '/api/trpc/[trpc].ts',
);
