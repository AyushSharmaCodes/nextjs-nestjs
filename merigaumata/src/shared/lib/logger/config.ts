import { configure, Sink } from '@logtape/logtape';
import { createConsoleSink } from './sinks/console.sink';
import { createSentrySink } from './sinks/sentry.sink';
import { createFileSink } from './sinks/file.sink';
import { clientEnv } from '@/core/env/client';

let isLoggingInitialized = false;

/**
 * Initializes and configures the LogTape logging infrastructure.
 * 
 * Sets up Console, Sentry, and File Sinks based on the current platform environment.
 * Enables automatic request context propagation inside Node.js using AsyncLocalStorage.
 */
export async function initLogTape() {
  if (isLoggingInitialized) return;
  isLoggingInitialized = true;

  const isProduction = process.env.NODE_ENV === 'production'; // ts-audit-ignore
  
  // In production, log info and above. In development, log debug and above.
  const lowestLevel = isProduction ? 'info' : 'debug';

  const sinks: Record<string, Sink> = {
    console: createConsoleSink(),
  };

  const activeSinks: string[] = ['console'];

  // Enable Sentry sink if DSN is configured
  type SentryWindow = { _sentry?: unknown };
  const windowWithSentry = (typeof window !== 'undefined' ? window : null) as SentryWindow | null;
  const hasSentry = !!(
    clientEnv.NEXT_PUBLIC_SENTRY_DSN ||
    (windowWithSentry && windowWithSentry._sentry !== undefined)
  );

  if (hasSentry) {
    try {
      sinks.sentry = createSentrySink();
      activeSinks.push('sentry');
    } catch {
      // Fallback silently if Sentry sink initialization fails
    }
  }

  // 2. Conditionally configure File Sink
  const fileSink = createFileSink();
  if (fileSink) {
    sinks.file = fileSink;
    activeSinks.push('file');
  }

  // 3. Setup AsyncLocalStorage on Node runtime server-side
  let contextLocalStorage = undefined;
  if (typeof window === 'undefined' && process.env.NEXT_RUNTIME === 'nodejs') { // ts-audit-ignore
    try {
      const { AsyncLocalStorage } = require('node:async_hooks');
      contextLocalStorage = new AsyncLocalStorage();
    } catch {
      // AsyncLocalStorage not supported or dynamic require blocked
    }
  }

  try {
    await configure({
      sinks,
      loggers: [
        {
          category: ['app'],
          lowestLevel,
          sinks: activeSinks,
        },
        // Filter out noisy LogTape internal meta logging unless warnings occur
        {
          category: ['logtape', 'meta'],
          lowestLevel: 'warning',
          sinks: ['console'],
        },
      ],
      contextLocalStorage,
    });
    } catch (err: unknown) {
      // If the logger itself fails, we have no choice but to use the system's
      // lowest-level output as a last resort.
      process.stderr.write(`[Logger Init Error] Failed to configure LogTape: ${err}\n`);
    }
}
