import { ApiResponseShape } from '../types';

export class ApiResponse<T = unknown> implements ApiResponseShape {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: { message: string; field: string | null; code: string | null }[];
  meta?: { page?: number; limit?: number; total?: number; totalPages?: number };

  private constructor(
    success: boolean,
    data?: T,
    message?: string,
    error?: string,
    details?: ApiResponseShape['details'],
    meta?: ApiResponseShape['meta'],
  ) {
    this.success = success;
    this.data = data;
    this.message = message;
    this.error = error;
    this.details = details;
    this.meta = meta;
  }

  static success<T>(data: T, message?: string): ApiResponse<T> {
    return new ApiResponse(true, data, message);
  }

  static error(message: string, code?: string, details?: ApiResponseShape['details']): ApiResponse<null> {
    return new ApiResponse(false, null, message, code, details);
  }

  static validationError(details: ApiResponseShape['details']): ApiResponse<null> {
    return new ApiResponse(false, null, 'Validation failed', 'VALIDATION_ERROR', details);
  }

  static paginated<T>(data: T, meta: ApiResponseShape['meta']): ApiResponse<T> {
    return new ApiResponse(true, data, undefined, undefined, undefined, meta);
  }
}
