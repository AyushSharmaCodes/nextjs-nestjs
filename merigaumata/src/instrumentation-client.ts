import * as Sentry from '@sentry/nextjs';
import { clientEnv } from '@/core/env/client';

const SENTRY_DSN = clientEnv.NEXT_PUBLIC_SENTRY_DSN;
const SENTRY_ENV = clientEnv.NEXT_PUBLIC_SENTRY_ENV;

Sentry.init({
  dsn: SENTRY_DSN,
  environment: SENTRY_ENV,

  // Adjust tracesSampleRate in production or under high load to control cost/quota
  tracesSampleRate: SENTRY_ENV === 'production' ? 0.2 : 1.0,

  // Session Replay options
  replaysSessionSampleRate: SENTRY_ENV === 'production' ? 0.05 : 0.2, // capture percentage of sessions
  replaysOnErrorSampleRate: 1.0, // capture replay if an error occurs

  integrations: [
    Sentry.replayIntegration({
      // Mask all PII text/media elements by default to preserve GDPR privacy compliance
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
});

// Native Next.js 15 Client-Side Router transition tracking hook
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
