export type AppErrorDetailsValue = string | number | boolean | null | AppErrorDetailsValue[] | { [key: string]: AppErrorDetailsValue };
export type AppErrorDetails = Record<string, AppErrorDetailsValue>;

/**
 * Enterprise standard Application Error base class.
 * Captures status codes, error details, and custom categories.
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly details: AppErrorDetails | null;

  constructor(message: string, code = 'INTERNAL_ERROR', status = 500, details: AppErrorDetails | null = null) {
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
