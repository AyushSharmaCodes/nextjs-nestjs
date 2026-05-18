import { AppError } from './app-error';

/**
 * Enterprise standard API Error class representing network/service errors.
 * Extends AppError to maintain a unified hierarchy.
 */
export class ApiError extends AppError {
  constructor(message: string, code = 'API_ERROR', status = 500, details?: unknown) {
    super(message, code, status, details);
    this.name = 'ApiError';
    
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError);
    }
  }
}

/**
 * Normalizes any error object (including AxiosError) into a standardized ApiError instance.
 */
export const normalizeError = (error: unknown): ApiError => {
  if (error instanceof ApiError) return error;

  // Handle Axios response errors
  if (error && typeof error === 'object' && 'response' in error) {
    const responseErr = error as { 
      response?: { 
        status: number; 
        data?: { 
          code?: string; 
          message?: string; 
          details?: unknown;
        }; 
      }; 
      message?: string; 
    };

    if (responseErr.response) {
      const { status, data } = responseErr.response;
      const code = data?.code || `HTTP_ERROR_${status}`;
      const message = data?.message || responseErr.message || 'An unexpected server error occurred';
      return new ApiError(message, code, status, data?.details);
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
