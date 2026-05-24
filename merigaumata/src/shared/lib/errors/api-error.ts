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
      errorCode: string | null;  // backend uses `errorCode`, not `code`
      code: string | null;       // kept for legacy compatibility
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
      // Backend sends `errorCode` (e.g. "AUTH_001"); fall back to `code` for legacy
      const code = (data !== null ? (data.errorCode ?? data.code) : null) || `HTTP_ERROR_${status}`;
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
    if (code === 'INVALID_EMAIL_OR_PASSWORD' || code === 'INVALID_PASSWORD') {
      code = 'AUTH_001';
    } else if (code === 'EMAIL_ALREADY_EXISTS' || code === 'USER_ALREADY_EXISTS') {
      code = 'AUTH_002';
    } else if (code === 'EMAIL_NOT_VERIFIED') {
      code = 'AUTH_003';
    } else if (code === 'OTP_EXPIRED') {
      code = 'AUTH_004';
    } else if (code === 'OTP_INVALID') {
      code = 'AUTH_005';
    } else if (code === 'MAGIC_LINK_EXPIRED') {
      code = 'AUTH_006';
    } else if (code === 'MAGIC_LINK_INVALID') {
      code = 'AUTH_007';
    } else if (code === 'MAGIC_LINK_ALREADY_USED') {
      code = 'AUTH_008';
    } else if (code === 'TOKEN_EXPIRED' || code === 'SESSION_EXPIRED') {
      code = 'AUTH_009';
    } else if (code === 'TOKEN_INVALID' || code === 'SESSION_INVALID') {
      code = 'AUTH_010';
    } else if (code === 'REFRESH_TOKEN_REUSE') {
      code = 'AUTH_011';
    } else if (code === 'GOOGLE_AUTH_FAILED') {
      code = 'AUTH_012';
    } else if (code === 'ACCOUNT_LOCKED') {
      code = 'AUTH_013';
    } else if (code === 'ACCOUNT_DISABLED') {
      code = 'AUTH_014';
    } else if (code === 'TOKEN_GENERATION_FAILED') {
      code = 'AUTH_050';
    } else if (code === 'DB_WRITE_FAILED') {
      code = 'AUTH_051';
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
