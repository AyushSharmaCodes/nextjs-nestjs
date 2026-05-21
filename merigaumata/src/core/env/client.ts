import { clientSchema } from './schema';
import { logger } from '@/shared/lib/logger';

/**
 * Validated client-side environment variables.
 * Throws at module load time if any required variable is missing or malformed.
 * Import `clientEnv` everywhere you need browser-accessible config.
 *
 * ⚠️  Never read process.env.NEXT_PUBLIC_* directly — use this instead.
 */
const _result = clientSchema.safeParse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
  NEXT_PUBLIC_SENTRY_ENV: process.env.NEXT_PUBLIC_SENTRY_ENV,
});

if (!_result.success) {
  const formatted = _result.error.issues
    .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  logger.error(`\n❌ Client environment validation failed:\n${formatted}\n`);
  throw new Error('Client environment validation failed — see above for details');
}

export const clientEnv = _result.data;

/**
 * @deprecated Use `clientEnv` instead. Kept temporarily for backward-compat with
 * existing imports that do `import { env } from '@/core/env/client'`.
 */
export const env = clientEnv;
