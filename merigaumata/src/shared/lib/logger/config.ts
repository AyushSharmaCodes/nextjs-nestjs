import { configure, Sink } from '@logtape/logtape';
import { createConsoleSink } from './sinks/console.sink';
import { createSentrySink } from './sinks/sentry.sink';
import { createFileSink } from './sinks/file.sink';

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

  const isProduction = process.env.NODE_ENV === 'production';
  
  // In production, log info and above. In development, log debug and above.
  const lowestLevel = isProduction ? 'info' : 'debug';

  const sinks: Record<string, Sink> = {
    console: createConsoleSink(),
  };

  const activeSinks: string[] = ['console'];

  // 1. Conditionally configure Sentry Sink
  const hasSentry = !!(
    process.env.NEXT_PUBLIC_SENTRY_DSN || 
    process.env.SENTRY_DSN || 
    (typeof window !== 'undefined' && (window as any).__SENTRY__)
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
  if (typeof window === 'undefined' && process.env.NEXT_RUNTIME === 'nodejs') {
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
  } catch (err) {
    // Prevent logger setup issues from crashing app boots
    // eslint-disable-next-line no-console
    console.error('Failed to configure LogTape logging system:', err);
  }
}
