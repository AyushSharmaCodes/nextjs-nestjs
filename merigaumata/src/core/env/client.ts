import { clientSchema } from './schema';

const _clientEnv = clientSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL,
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN || process.env.SENTRY_DSN,
  NEXT_PUBLIC_SENTRY_ENV: process.env.NEXT_PUBLIC_SENTRY_ENV || process.env.NODE_ENV,
});

if (!_clientEnv.success) {
  console.error('❌ Invalid client environment variables:', _clientEnv.error.format());
  throw new Error('Invalid client environment variables');
}

export const env = _clientEnv.data;
