import { ZodError } from 'zod';
import { AppError, type AppErrorDetails } from './app-error';
import { ApiError, normalizeError } from './api-error';

/**
 * Standardizes any arbitrary error into a unified AppError (or ApiError).
 * Highly useful for centralizing try-catch flows in server actions, 
 * page layouts, and api route handlers.
 */
export function mapToAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  // Handle Zod Schema validation failures
  if (error instanceof ZodError) {
    return new AppError(
      'Invalid data provided. Please verify all fields.',
      'VALIDATION_ERROR',
      400,
      error.flatten() as unknown as AppErrorDetails
    );
  }

  // Handle standard network/Axios API errors
  if (error && typeof error === 'object' && ('response' in error || 'request' in error)) {
    return normalizeError(error);
  }

  // Handle generic native JS error
  if (error instanceof Error) {
    return new AppError(
      error.message,
      'RUNTIME_ERROR',
      500,
      { stack: error.stack ?? null }
    );
  }

  // Handle string errors
  if (typeof error === 'string') {
    return new AppError(error, 'UNKNOWN_STRING_ERROR', 500);
  }

  // Fallback for primitive or completely unknown errors
  return new AppError(
    'An unexpected system anomaly has occurred.',
    'UNKNOWN_SYSTEM_ERROR',
    500,
    typeof error === 'object' && error !== null ? error as unknown as AppErrorDetails : { raw: String(error) }
  );
}
