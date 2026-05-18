import * as Sentry from '@sentry/nextjs';

/**
 * Next.js instrumentation registration file.
 * This runs on server startup across both Node.js and Edge runtimes,
 * allowing standard initialization of monitoring layers like Sentry and LogTape.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config');
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config');
  }
}

export const onRequestError = Sentry.captureRequestError;
