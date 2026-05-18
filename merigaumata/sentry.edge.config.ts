import * as Sentry from '@sentry/nextjs';

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN || 'https://9250d32ee143e651fae91c2a8a1f9c20@o4510681165594624.ingest.de.sentry.io/4510681167757392';
const SENTRY_ENV = process.env.NEXT_PUBLIC_SENTRY_ENV || process.env.NODE_ENV || 'development';

Sentry.init({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENV,

  // Edge performance monitoring sample rate
  tracesSampleRate: SENTRY_ENV === 'production' ? 0.2 : 1.0,
});
