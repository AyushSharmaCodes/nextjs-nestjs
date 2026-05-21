/**
 * @file auth.types.ts
 *
 * Shared types for the auth feature on the frontend.
 * Mirrors the backend's typed shapes to ensure end-to-end type safety.
 *
 * Rules:
 *  - ZERO `any` — explicit type narrowing everywhere
 *  - Dates are ISO 8601 strings, never Date objects
 *  - UserId is a branded type to prevent raw strings being used as IDs
 *  - AuthErrorCode covers all known backend error codes
 */

// ---------------------------------------------------------------------------
// Branded types
// ---------------------------------------------------------------------------

/** Branded user ID — prevents plain strings being used where UserId is expected. */
export type UserId = string & { readonly _brand: 'UserId' };

/** Type-safe constructor for UserId. */
export function toUserId(raw: string): UserId {
  if (!raw) throw new Error('toUserId: empty string');
  return raw as UserId;
}

// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export type Role = 'CUSTOMER' | 'ADMIN' | 'MANAGER';
export type OtpType = 'LOGIN' | 'EMAIL_VERIFICATION';

export function isRole(value: string): value is Role {
  return value === 'CUSTOMER' || value === 'ADMIN' || value === 'MANAGER';
}

// ---------------------------------------------------------------------------
// Auth error codes — mirrors backend AUTH_ERROR_CODES registry
// ---------------------------------------------------------------------------

export type AuthErrorCode =
  | 'AUTH_001'  // INVALID_CREDENTIALS
  | 'AUTH_002'  // EMAIL_ALREADY_EXISTS
  | 'AUTH_003'  // EMAIL_NOT_VERIFIED
  | 'AUTH_004'  // OTP_EXPIRED
  | 'AUTH_005'  // OTP_INVALID
  | 'AUTH_006'  // MAGIC_LINK_EXPIRED
  | 'AUTH_007'  // MAGIC_LINK_INVALID
  | 'AUTH_008'  // MAGIC_LINK_ALREADY_USED
  | 'AUTH_009'  // TOKEN_EXPIRED
  | 'AUTH_010'  // TOKEN_INVALID
  | 'AUTH_011'  // REFRESH_TOKEN_REUSE
  | 'AUTH_012'  // GOOGLE_AUTH_FAILED
  | 'AUTH_013'  // ACCOUNT_LOCKED
  | 'AUTH_014'  // ACCOUNT_DISABLED
  | 'AUTH_050'  // TOKEN_GENERATION_FAILED
  | 'AUTH_051'; // DB_WRITE_FAILED

/** Type-guard for AuthErrorCode. */
export function isAuthErrorCode(value: string): value is AuthErrorCode {
  return /^AUTH_\d{3}$/.test(value);
}

// ---------------------------------------------------------------------------
// API response shapes (mirrors backend ApiSuccessResponse / ApiErrorResponse)
// ---------------------------------------------------------------------------

export interface ApiSuccessResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly message: string;
  readonly statusCode: number;
  readonly timestamp: string;
  readonly requestId: string;
}

export interface ApiErrorResponse {
  readonly success: false;
  readonly errorCode: string;
  readonly message: string;
  readonly statusCode: number;
  readonly timestamp: string;
  readonly path: string;
  readonly requestId: string;
  readonly meta?: Readonly<Record<string, string | number>>;
  readonly details?: ReadonlyArray<{
    readonly message: string;
    readonly field: string | null;
    readonly code: string | null;
  }>;
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

// ---------------------------------------------------------------------------
// Auth domain response types (mirrors backend DTOs)
// ---------------------------------------------------------------------------

export interface UserResponseData {
  readonly userId: UserId;
  readonly email: string;
  readonly displayName: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly image: string | null;
  readonly role: Role;
  readonly emailVerified: boolean;
  readonly twoFactorEnabled: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface AuthResponseData {
  readonly userId: UserId;
  readonly email: string;
  readonly displayName: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly image: string | null;
  readonly role: Role;
  readonly emailVerified: boolean;
  readonly twoFactorEnabled: boolean;
  readonly sessionId: string;
  readonly tokenExpiresAt: string;
  readonly twoFactorVerified: boolean;
  readonly createdAt: string;
}

// ---------------------------------------------------------------------------
// Typed API error class
// ---------------------------------------------------------------------------

/**
 * Typed error class for auth API failures.
 * Always contains a typed errorCode (or 'UNKNOWN') and requestId for tracing.
 */
export class AuthApiError extends Error {
  readonly errorCode: AuthErrorCode | 'UNKNOWN';
  readonly statusCode: number;
  readonly requestId: string;
  readonly meta?: Readonly<Record<string, string | number>>;

  constructor(params: {
    message: string;
    errorCode: string;
    statusCode: number;
    requestId: string;
    meta?: Readonly<Record<string, string | number>>;
  }) {
    super(params.message);
    this.name = 'AuthApiError';
    this.errorCode = isAuthErrorCode(params.errorCode)
      ? params.errorCode
      : 'UNKNOWN';
    this.statusCode = params.statusCode;
    this.requestId = params.requestId;
    this.meta = params.meta;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

// ---------------------------------------------------------------------------
// Legacy shape compatibility (keep for existing hook consumers)
// ---------------------------------------------------------------------------

export interface User {
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  requiresPasswordChange?: boolean;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export interface ApiErrorDetails {
  [key: string]: string | number | boolean | null | ApiErrorDetails | ApiErrorDetails[];
}

export interface AuthActionFailure {
  success: false;
  error: string;
  message: string;
  details: ApiErrorDetails | null;
}

export interface LoginInitData {
  requiresOtp: boolean;
  message: string;
}

export interface SignupInitData {
  requiresOtp: boolean;
  message: string;
}

export interface VerifyOtpData {
  user?: User;
}

export interface ResendOtpData {
  message: string;
}

export interface AuthActionSuccess<T> {
  success: true;
  data: T;
}

export type AuthActionResult<T> = AuthActionSuccess<T> | AuthActionFailure;

export interface AuthApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
  error?: string;
  details?: ApiErrorDetails;
}
