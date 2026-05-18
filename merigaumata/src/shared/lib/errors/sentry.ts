import * as Sentry from '@sentry/nextjs';

const SENSITIVE_KEYS = [
  'password', 'token', 'auth', 'authorization', 'cookie', 'secret',
  'key', 'creditcard', 'card', 'cvv', 'cvc', 'ssn', 'jwt', 'payload',
  'email', 'phone', 'address', 'pin'
];

/**
 * Deeply scrubs PII and secret values recursively from any payload object.
 */
export function sanitizePayload(data: unknown): unknown {
  if (!data) return data;
  
  if (typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data.map(sanitizePayload);
  }

  const result: Record<string, unknown> = {};
  
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    const isSensitive = SENSITIVE_KEYS.some((sensitiveKey) => 
      key.toLowerCase().includes(sensitiveKey)
    );

    if (isSensitive) {
      result[key] = '[REDACTED_SENSITIVE_DATA]';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = sanitizePayload(value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

/**
 * Enterprise standard error reporter for Sentry.
 * Automatically scrubs sensitive payload fields and attaches tags + extra context.
 * 
 * @param error The native error or AppError instance
 * @param extraContext Custom structured data metadata
 */
export function reportToSentry(error: unknown, extraContext?: Record<string, unknown>) {
  // If Sentry is not initialized, abort gracefully
  if (!Sentry.getClient()) {
    return;
  }

  const sanitizedContext = extraContext ? sanitizePayload(extraContext) as Record<string, unknown> : {};

  Sentry.withScope((scope) => {
    // Inject custom tags/extras safely
    if (sanitizedContext) {
      Object.entries(sanitizedContext).forEach(([key, value]) => {
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          scope.setTag(key, value);
        }
        scope.setExtra(key, value);
      });
    }

    if (error instanceof Error) {
      Sentry.captureException(error);
    } else if (typeof error === 'string') {
      Sentry.captureMessage(error);
    } else {
      Sentry.captureException(new Error(JSON.stringify(error)));
    }
  });
}

/**
 * Dynamic Sentry User Context Setter.
 * Safely tags the current session without exposing raw personal info (scrubs PII).
 */
export function setSentryUserContext(user: { id: string; email?: string; role?: string; tenantId?: string }) {
  if (!Sentry.getClient()) return;

  Sentry.setUser({
    id: user.id,
    email: user.email ? '[PII_MASKED_EMAIL]' : undefined,
    role: user.role,
    tenantId: user.tenantId,
  });
}
