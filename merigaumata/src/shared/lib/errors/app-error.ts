/**
 * Enterprise standard Application Error base class.
 * Captures status codes, error details, and custom categories.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details?: unknown;

  constructor(message: string, code = 'INTERNAL_ERROR', status = 500, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.status = status;
    this.details = details;

    // Preserve V8 engine stack traces properly
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }
}
