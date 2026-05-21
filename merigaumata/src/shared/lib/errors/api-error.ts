import { AppError, type AppErrorDetails } from './app-error';

/**
 * Enterprise standard API Error class representing network/service errors.
 * Extends AppError to maintain a unified hierarchy.
 */
export class ApiError extends AppError {
  constructor(message: string, code = 'API_ERROR', status = 500, details: AppErrorDetails | null = null) {
    super(message, code, status, details);
    this.name = 'ApiError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

interface AxiosErrorShape {
  response: {
    status: number;
    data: {
      code: string | null;
      message: string | null;
      details: AppErrorDetails | null;
    } | null;
  } | null;
  message: string | null;
}

interface BetterAuthErrorShape {
  message: string | null;
  code: string | null;
  status: number | null;
  statusCode: number | null;
  statusText: string | null;
  error: {
    message: string | null;
    code: string | null;
    status: number | null;
  } | null;
}

function isErrorObject(err: unknown): err is Record<string, unknown> {
  return err !== null && typeof err === 'object';
}

/**
 * Normalizes any error object (including AxiosError) into a standardized ApiError instance.
 */
export const normalizeError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;

  // Handle Axios response errors
  if (isErrorObject(error) && 'response' in error) {
    const responseErr = error as unknown as AxiosErrorShape;

    if (responseErr.response !== null) {
      const status = responseErr.response.status;
      const data = responseErr.response.data;
      const code = (data !== null ? data.code : null) || `HTTP_ERROR_${status}`;
      const message = (data !== null ? data.message : null) || responseErr.message || 'An unexpected server error occurred';
      return new ApiError(message, code, status, data !== null ? data.details : null);
    }
  }

  // Handle Better Auth client error shape and generic objects with messages
  if (isErrorObject(error)) {
    const errObj = error as unknown as BetterAuthErrorShape;

    // Better Auth sometimes wraps the original response in `error`
    const nestedError = errObj.error !== null && typeof errObj.error === 'object' ? errObj.error : null;

    // Extract message
    let message = typeof errObj.message === 'string' ? errObj.message : null;
    if (message === null && nestedError !== null && typeof nestedError.message === 'string') {
      message = nestedError.message;
    }

    // Extract code
    let code = typeof errObj.code === 'string' ? errObj.code : null;
    if (code === null && nestedError !== null && typeof nestedError.code === 'string') {
      code = nestedError.code;
    }

    // Map Better Auth specific codes to our system codes
    if (code === 'INVALID_EMAIL_OR_PASSWORD') {
      code = 'AUTH_001';
    }

    // Fallbacks
    if (message === null) {
      // If it has statusText but no message
      if (typeof errObj.statusText === 'string' && errObj.statusText !== '') {
        message = errObj.statusText;
      }
    }

    if (message !== null) {
      const status = errObj.status ?? errObj.statusCode ?? (nestedError !== null ? nestedError.status : null) ?? 400;
      return new ApiError(message, code ?? 'AUTH_ERROR', status);
    }
  }

  // Handle generic native JavaScript errors
  if (error instanceof Error) {
    return new ApiError(error.message, 'UNEXPECTED_ERROR', 500);
  }

  // Fallback for primitive or unknown errors
  return new ApiError(
    typeof error === 'string' ? error : 'A network connection or system error occurred',
    'NETWORK_ERROR',
    0
  );
};

