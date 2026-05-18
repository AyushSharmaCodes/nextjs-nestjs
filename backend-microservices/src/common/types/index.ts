export type UserRole = 'admin' | 'manager' | 'customer';

export type AuthProvider = 'local' | 'google';

export type OtpPurpose = 'LOGIN' | 'PASSWORD_CHANGE' | 'PASSWORD_RESET' | 'ACCOUNT_DELETION';

export type DeletionStatus = 'PENDING' | 'SCHEDULED' | null;

export interface UserContext {
  userId: string;
  email: string;
  role: UserRole;
  permissions: string[];
  isBlocked: boolean;
  deletionStatus: DeletionStatus;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  sessionId: string;
  iat?: number;
  exp?: number;
}

export interface DeviceInfo {
  userAgent?: string;
  deviceName?: string;
  platform?: string;
  browser?: string;
}

export interface SessionMetadata {
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: DeviceInfo;
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}

export interface ApiResponseShape<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: { message: string; field: string | null; code: string | null }[];
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}

export type SupportedLanguage = 'en' | 'hi' | 'ta' | 'te';

const SUPPORTED_LANGUAGES: ReadonlySet<string> = new Set(['en', 'hi', 'ta', 'te']);

export function isSupportedLanguage(lang: string | undefined | null): lang is SupportedLanguage {
  return typeof lang === 'string' && SUPPORTED_LANGUAGES.has(lang);
}
