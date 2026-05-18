export enum ErrorCode {
  // Standard HTTP status codes
  SUCCESS = '200',
  CREATED = '201',
  BAD_REQUEST = '400',
  UNAUTHORIZED = '401',
  FORBIDDEN = '403',
  NOT_FOUND = '404',
  CONFLICT = '409',
  INTERNAL_ERROR = '500',

  // Authentication & Session specific sub-codes
  AUTH_EMAIL_EXISTS = '40001',
  AUTH_INVALID_CREDENTIALS = '40101',
  AUTH_EMAIL_NOT_VERIFIED = '40102',
  AUTH_USER_BLOCKED = '40301',
  AUTH_USER_DELETED = '40302',
  AUTH_SESSION_EXPIRED = '40103',
  AUTH_SESSION_REVOKED = '40104',
  AUTH_TOKEN_MISSING = '40105',

  // OTP specific sub-codes
  OTP_NOT_FOUND = '40401',
  OTP_EXPIRED = '40002',
  OTP_MAX_ATTEMPTS_EXCEEDED = '40003',
  OTP_INVALID = '40004',

  // Database / Record errors
  DB_RECORD_NOT_FOUND = '40402',
  DB_UNIQUE_CONSTRAINT_VIOLATION = '40901',
}

export const ErrorMessageMap: Record<ErrorCode, string> = {
  [ErrorCode.SUCCESS]: 'Operation completed successfully.',
  [ErrorCode.CREATED]: 'Resource created successfully.',
  [ErrorCode.BAD_REQUEST]: 'The request could not be processed. Please check your inputs.',
  [ErrorCode.UNAUTHORIZED]: 'Please log in to continue.',
  [ErrorCode.FORBIDDEN]: 'You do not have permission to access this resource.',
  [ErrorCode.NOT_FOUND]: 'The requested resource could not be found.',
  [ErrorCode.CONFLICT]: 'The request conflicts with the current state.',
  [ErrorCode.INTERNAL_ERROR]: 'An unexpected system error occurred. Please try again later.',

  [ErrorCode.AUTH_EMAIL_EXISTS]: 'This email address is already registered. Try logging in or resetting your password.',
  [ErrorCode.AUTH_INVALID_CREDENTIALS]: 'Invalid credentials. Please double-check your email and password.',
  [ErrorCode.AUTH_EMAIL_NOT_VERIFIED]: 'Your email address is not verified yet. We have sent a verification code to your email.',
  [ErrorCode.AUTH_USER_BLOCKED]: 'Your account has been temporarily blocked. Please contact support.',
  [ErrorCode.AUTH_USER_DELETED]: 'This account has been deleted.',
  [ErrorCode.AUTH_SESSION_EXPIRED]: 'Your session has expired. Please log in again.',
  [ErrorCode.AUTH_SESSION_REVOKED]: 'Your session was terminated or revoked.',
  [ErrorCode.AUTH_TOKEN_MISSING]: 'Authentication token is missing. Please log in.',

  [ErrorCode.OTP_NOT_FOUND]: 'No active OTP verification session found. Please request a new code.',
  [ErrorCode.OTP_EXPIRED]: 'The verification code has expired. Please request a new one.',
  [ErrorCode.OTP_MAX_ATTEMPTS_EXCEEDED]: 'Too many incorrect attempts. Please wait a few minutes and request a new code.',
  [ErrorCode.OTP_INVALID]: 'Invalid verification code. Please enter the correct code.',

  [ErrorCode.DB_RECORD_NOT_FOUND]: 'The requested record could not be found in our database.',
  [ErrorCode.DB_UNIQUE_CONSTRAINT_VIOLATION]: 'A record with duplicate information already exists.',
};

/**
 * Retrieves the standard error response object (message + code) for the given ErrorCode.
 */
export function getErrorResponse(code: ErrorCode, customMessage?: string) {
  return {
    message: customMessage || ErrorMessageMap[code] || 'An error occurred',
    error: code,
  };
}
