import { createNextApiHandler } from '@trpc/server/adapters/next';
import { appRouter } from '~/server/api/root';
import { createTRPCContext } from '~/server/api/trpc';
import { captureException, withSentry } from '@sentry/nextjs';
import { env } from '~/env.mjs';

// export API handler
export default withSentry(
  createNextApiHandler({
    router: appRouter,
    createContext: createTRPCContext,
    onError({ error, path }) {
      if (error.code === 'INTERNAL_SERVER_ERROR') {
        captureException(error);
      }

      if (env.NODE_ENV === 'development') {
        console.error(
          `❌ tRPC failed on ${path ?? '<no-path>'}: ${error.message}`,
        );
      }
    },
  }),
);
