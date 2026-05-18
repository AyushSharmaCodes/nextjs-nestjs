import { serverSchema } from './schema';

const _serverEnv = serverSchema.safeParse({
  NODE_ENV: process.env.NODE_ENV || 'development',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  SENTRY_ORG: process.env.SENTRY_ORG,
  SENTRY_PROJECT: process.env.SENTRY_PROJECT,
  SENTRY_AUTH_TOKEN: process.env.SENTRY_AUTH_TOKEN,
});

if (!_serverEnv.success) {
  console.error('❌ Invalid server environment variables:', _serverEnv.error.format());
  throw new Error('Invalid server environment variables');
}

export const env = _serverEnv.data;
