import {
  type AuthResponseData,
  type ApiSuccessResponse,
  isRole,
  toUserId,
} from '../types/auth.types';

function isEnvelope<T>(value: unknown): value is ApiSuccessResponse<T> {
  return Boolean(
    value &&
    typeof value === 'object' &&
    'success' in value &&
    (value as { success?: unknown }).success === true &&
    'data' in value
  );
}

function coerceAuthResponseData(value: unknown): AuthResponseData | null {
  if (!value || typeof value !== 'object') {
    return null;
  }

  const raw = value as Record<string, unknown>;
  const userId = typeof raw['userId'] === 'string' ? raw['userId'] : '';
  const email = typeof raw['email'] === 'string' ? raw['email'] : '';
  const roleRaw = typeof raw['role'] === 'string' ? raw['role'].toUpperCase() : '';

  if (!userId || !email || !isRole(roleRaw)) {
    return null;
  }

  return {
    userId: toUserId(userId),
    email,
    displayName:
      typeof raw['displayName'] === 'string'
        ? raw['displayName']
        : email.split('@')[0] ?? email,
    firstName: typeof raw['firstName'] === 'string' ? raw['firstName'] : null,
    lastName: typeof raw['lastName'] === 'string' ? raw['lastName'] : null,
    image: typeof raw['image'] === 'string' ? raw['image'] : null,
    role: roleRaw,
    emailVerified: raw['emailVerified'] === true,
    twoFactorEnabled: raw['twoFactorEnabled'] === true,
    sessionId: typeof raw['sessionId'] === 'string' ? raw['sessionId'] : '',
    tokenExpiresAt:
      typeof raw['tokenExpiresAt'] === 'string'
        ? raw['tokenExpiresAt']
        : new Date(0).toISOString(),
    twoFactorVerified: raw['twoFactorVerified'] === true,
    createdAt:
      typeof raw['createdAt'] === 'string'
        ? raw['createdAt']
        : new Date(0).toISOString(),
    lastLoginAt:
      typeof raw['lastLoginAt'] === 'string'
        ? raw['lastLoginAt']
        : null,
  };
}

export function extractAuthResponseData(value: unknown): AuthResponseData | null {
  if (isEnvelope<AuthResponseData>(value)) {
    return coerceAuthResponseData(value.data);
  }

  return coerceAuthResponseData(value);
}
