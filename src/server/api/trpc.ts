/**
 * YOU PROBABLY DON'T NEED TO EDIT THIS FILE, UNLESS:
 * 1. You want to modify request context (see Part 1).
 * 2. You want to create a new middleware or type of procedure (see Part 3).
 *
 * TL;DR - this is where all the tRPC server stuff is created and plugged in.
 * The pieces you will need to use are documented accordingly near the end.
 */
/**
 * 2. INITIALIZATION
 *
 * This is where the tRPC API is initialized, connecting the context and transformer. We also parse
 * ZodErrors so that you get typesafety on the frontend if your procedure fails due to validation
 * errors on the backend.
 */

import { initTRPC, TRPCError } from '@trpc/server';
import type { CreateNextContextOptions } from '@trpc/server/adapters/next';
import { db } from '../db';
import superjson from 'superjson';
import { ZodError } from 'zod';
import { getAuth } from '@clerk/nextjs/server';
import * as Sentry from '@sentry/nextjs';
import { type NextApiRequest, type NextApiResponse } from 'next';
import type {
  CheckAuthorizationFromSessionClaims,
  ServerGetToken,
  SharedSignedInAuthObjectProperties,
} from '@clerk/types';

export interface SignedOutAuthObject {
  sessionClaims: null;
  sessionId: null;
  sessionStatus: null;
  actor: null;
  userId: null;
  orgId: null;
  orgRole: null;
  orgSlug: null;
  orgPermissions: null;
  factorVerificationAge: null;
  getToken: ServerGetToken;
  has: CheckAuthorizationFromSessionClaims;
}

export type SignedInAuthObject = SharedSignedInAuthObjectProperties & {
  getToken: ServerGetToken;
  has: CheckAuthorizationFromSessionClaims;
};

/**
 * 1. CONTEXT
 *
 * This section defines the "contexts" that are available in the backend API.
 *
 * These allow you to access things like the database, the session, etc, when processing a request.
 *
 */

interface AuthContext {
  auth: SignedInAuthObject | SignedOutAuthObject;
  req: NextApiRequest;
  res: NextApiResponse;
}

/**
 * This helper generates the "internals" for a tRPC context. If you need to use
 * it, you can export it from here.
 *
 * Examples of things you may need it for:
 * - testing, so we dont have to mock Next.js' req/res.
 * - trpc's `createSSGHelpers` where we don't have req/res.
 * @see https://create.t3.gg/en/usage/trpc#-serverapitrpcts
 */
const createInnerTRPCContext = ({ auth, req, res }: AuthContext) => {
  return {
    auth,
    prisma: db,
    req,
    res,
  };
};

/**
 * This is the actual context you'll use in your router. It will be used to
 * process every request that goes through your tRPC endpoint.
 * @link https://trpc.io/docs/context
 */
export const createTRPCContext = ({ req, res }: CreateNextContextOptions) => {
  return createInnerTRPCContext({ auth: getAuth(req), req, res });
};

export type TRPCContext = Awaited<ReturnType<typeof createTRPCContext>>;
export type AuthedTRPCContext = TRPCContext & { auth: SignedInAuthObject };

const t = initTRPC.context<typeof createTRPCContext>().create({
  transformer: superjson,
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

const sentryMiddleware = t.middleware(
  Sentry.trpcMiddleware({
    attachRpcInput: true,
  }),
);

/**
 * Create a server-side caller.
 *
 * @see https://trpc.io/docs/server/server-side-calls
 */
export const createCallerFactory = t.createCallerFactory;

/**
 * 3. ROUTER & PROCEDURE (THE IMPORTANT BIT)
 *
 * These are the pieces you use to build your tRPC API. You should import these
 * a lot in the /src/server/api/routers folder.
 */

/**
 * This is how you create new routers and subrouters in your tRPC API.
 * @see https://trpc.io/docs/router
 */
export const createTRPCRouter = t.router;

/**
 * Public (unauthed) procedure
 *
 * This is the base piece you use to build new queries and mutations on your
 * tRPC API. It does not guarantee that a user querying is authorized, but you
 * can still access user session data if they are logged in.
 */
export const publicProcedure = t.procedure.use(sentryMiddleware);

/**
 * Reusable middleware that enforces users are logged in before running the
 * procedure.
 */
const enforceUserIsAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.auth.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: {
      auth: ctx.auth,
    },
  });
});

/**
 * Protected (authed) procedure
 *
 * If you want a query or mutation to ONLY be accessible to logged in users, use
 * this. It verifies the session is valid and guarantees ctx.session.user is not
 * null
 *
 * @see https://trpc.io/docs/procedures
 */
export const protectedProcedure = t.procedure
  .use(enforceUserIsAuthed)
  .use(sentryMiddleware);
