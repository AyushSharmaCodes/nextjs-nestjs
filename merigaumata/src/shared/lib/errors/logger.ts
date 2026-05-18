import { logger } from '../logger/logger';
import { mapToAppError } from './error-mapper';
import { reportToSentry } from './sentry';

/**
 * Unified error handler.
 * Automatically:
 * 1. Normalizes the error (Zod, Axios, or Native) into a standard AppError structure.
 * 2. Emits a structured LogTape error log with rich metadata.
 * 3. Reports the exception to Sentry with PII-safe sanitized context tags.
 * 
 * @param error The thrown error object, message string, or primitive
 * @param context Custom structured parameters to log alongside the exception
 */
export function logError(error: unknown, context?: Record<string, unknown>) {
  const appError = mapToAppError(error);

  const errorMetadata = {
    code: appError.code,
    status: appError.status,
    details: appError.details,
    stack: appError.stack,
    ...context,
  };

  // Structured LogTape logging.
  // Because our LogTape Sentry Sink is enabled, Sentry will also register this log, 
  // ensuring the preceding logs are perfectly correlation-linked as breadcrumbs.
  logger.error(
    `💥 Centralized Error Captured [${appError.code}]: ${appError.message}`, 
    errorMetadata
  );

  // Dispatch details safely to the Sentry Crash Reporting platform
  reportToSentry(appError, context);
}
