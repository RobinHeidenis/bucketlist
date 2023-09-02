// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from '@sentry/nextjs';
import { prisma } from '~/server/db';

Sentry.init({
  dsn: 'https://2844681f750f04f62534c46b59ad044e@o4505630625824768.ingest.sentry.io/4505630635393024',

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,
  integrations: [new Sentry.Integrations.Prisma({ client: prisma })],
});
