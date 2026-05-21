export type Role = 'USER' | 'ADMIN' | 'MANAGER';

export interface User {
  email: string;
  role: Role;
  name?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  message: string;
}

export type OtpType = 'LOGIN' | 'EMAIL_VERIFICATION';

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
