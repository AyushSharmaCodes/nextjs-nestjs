import { withContext } from '@logtape/logtape';

/**
 * Structured Logging Context Types
 */
export interface LoggerContext {
  requestId?: string;
  traceId?: string;
  spanId?: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  route?: string;
  environment?: string;
  feature?: string;
  tenantId?: string;
  [key: string]: unknown;
}

// Client-side static context storage (fallback since AsyncLocalStorage is server-only)
let clientContext: LoggerContext = {};

/**
 * Sets persistent client-side log context (e.g. after user logs in).
 */
export function setClientLoggingContext(context: LoggerContext) {
  if (typeof window !== 'undefined') {
    clientContext = { ...clientContext, ...context };
  }
}

/**
 * Gets the current client-side log context.
 */
export function getClientLoggingContext(): LoggerContext {
  return clientContext;
}

/**
 * Clear the client log context (e.g. after logout).
 */
export function clearClientLoggingContext() {
  clientContext = {};
}

/**
 * Contextual execution helper.
 * 
 * Server-side: uses LogTape + Node AsyncLocalStorage to propagate implicitly.
 * Client-side / Edge: executes callback directly, combining metadata properties.
 */
export function runWithLoggingContext<T>(
  metadata: LoggerContext,
  callback: () => T
): T {
  // If in browser or edge where AsyncLocalStorage may be unsupported, execute callback
  // but enrich standard context safely
  if (typeof window !== 'undefined' || !process.env.NEXT_RUNTIME || process.env.NEXT_RUNTIME === 'edge') {
    setClientLoggingContext(metadata);
    return callback();
  }

  // Node runtime: execute inside LogTape's AsyncLocalStorage scope
  return withContext(metadata, callback);
}
