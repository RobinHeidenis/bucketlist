import { withSentryConfig } from '@sentry/nextjs';

/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
await import('./src/env.mjs');

/** @type {import("next").NextConfig} */
const config = {
  serverExternalPackages: ['require-in-the-middle', 'import-in-the-middle'],
  reactStrictMode: true,
  /**
   * If you have `experimental: { appDir: true }` set, then you must comment the below `i18n` config out
   * @see https://github.com/vercel/next.js/issues/41980
   */
  i18n: {
    locales: ['en'],
    defaultLocale: 'en',
  },
  images: {
    domains: [
      'cdn.discordapp.com',
      'ui-avatars.com',
      'www.themoviedb.org',
      'image.tmdb.org',
      'img.clerk.com',
    ],
  },
};

export default withSentryConfig(config, {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,

  widenClientFileUpload: true,
  tunnelRoute: '/monitoring',
  disableLogger: true,

  org: 'fractum',
  project: 'bucketlist',
});
