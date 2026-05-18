import { getSentrySink } from '@logtape/sentry';

/**
 * Creates and configures the LogTape Sentry Sink.
 * This establishes "Trace-Connected Logging":
 * - Emitted LogTape logs are mirrored as Sentry Breadcrumbs leading up to errors.
 * - Captures context and automatically correlates active Sentry spans/traces.
 */
export function createSentrySink() {
  return getSentrySink({
    // Attach logs as breadcrumbs automatically.
    // This allows visual auditing of the request lifecycle inside Sentry issue pages.
    enableBreadcrumbs: true,
  });
}
