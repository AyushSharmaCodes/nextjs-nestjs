export const AUTH_MESSAGES = {
  REGISTER_SUCCESS: 'Registration successful',
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  OTP_SENT: 'OTP sent to your email',
  EMAIL_VERIFIED: 'Email verified successfully',
  PASSWORD_RESET_EMAIL_SENT: 'If the account exists, password reset instructions have been sent',
  PASSWORD_CHANGED: 'Password changed successfully',
  SESSION_EXPIRED: 'Your session has expired. Please login again.',
  INVALID_CREDENTIALS: 'Invalid email or password',
  INVALID_OTP: 'Invalid or expired OTP',
  ACCOUNT_BLOCKED: 'Your account has been blocked. Please contact support.',
  GOOGLE_ONLY_VERIFICATION: 'Google account users cannot use password verification',
  EMAIL_EXISTS: 'Email already exists',
  EMAIL_NOT_FOUND: 'Email not found',
} as const;

export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  CREDENTIALS_VALIDATION_FAILED: 'CREDENTIALS_VALIDATION_FAILED',
  OTP_EXPIRED: 'OTP_EXPIRED',
  OTP_INVALID: 'OTP_INVALID',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
} as const;

export const JWT_CONFIG = {
  ACCESS_TOKEN_EXPIRY: '1h',
  REFRESH_TOKEN_EXPIRY: '7d',
  JWT_ALGORITHM: 'RS256',
  JWT_ISSUER: 'merigaumata-auth',
} as const;

export const OTP_CONFIG = {
  EXPIRY_MINUTES: 10,
  MAX_ATTEMPTS: 3,
  RATE_LIMIT_WINDOW_MINUTES: 15,
  RATE_LIMIT_MAX_REQUESTS: 3,
} as const;

export const SESSION_CONFIG = {
  MAX_CONCURRENT_SESSIONS: 5,
  REFRESH_TOKEN_LENGTH: 32,
  ACCESS_TOKEN_LENGTH: 32,
} as const;

export const ORDER_STATUS = {
  CREATED: 'CREATED',
  CONFIRMED: 'CONFIRMED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
  RETURN_REQUESTED: 'RETURN_REQUESTED',
  RETURNED: 'RETURNED',
  REFUNDED: 'REFUNDED',
} as const;

export const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  CREATED: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PROCESSING', 'CANCELLED'],
  PROCESSING: ['SHIPPED', 'CANCELLED'],
  SHIPPED: ['DELIVERED', 'RETURN_REQUESTED'],
  DELIVERED: ['RETURN_REQUESTED'],
  RETURN_REQUESTED: ['RETURNED', 'CANCELLED'],
  RETURNED: ['REFUNDED'],
  CANCELLED: [],
  REFUNDED: [],
};
