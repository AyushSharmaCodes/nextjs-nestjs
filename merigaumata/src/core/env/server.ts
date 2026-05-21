import { serverSchema } from './schema';
import { logger } from '@/shared/lib/logger';

/**
 * Validated server-side environment variables.
 * Only safe to import in Server Components, API routes, middleware, and instrumentation.
 * Will throw if imported in a browser context or if required vars are missing.
 *
 * ⚠️  Never read process.env.* directly in server code — use this instead.
 */
const _result = serverSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  SENTRY_ORG: process.env.SENTRY_ORG,
  SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
  LOG_FILE_PATH: process.env.LOG_FILE_PATH,
});

if (!_result.success) {
  const formatted = _result.error.issues
    .map((issue) => `  • ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  logger.error(`\n❌ Server environment validation failed:\n${formatted}\n`);
  throw new Error('Server environment validation failed — see above for details');
}

export const serverEnv = _result.data;

/**
 * @deprecated Use `serverEnv` instead. Kept temporarily for backward-compat.
 */
export const env = serverEnv;
