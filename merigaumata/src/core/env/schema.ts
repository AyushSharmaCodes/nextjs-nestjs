import { z } from 'zod';

export const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']),
  GEMINI_API_KEY: z.string().optional(),
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
});

export const clientSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().url().optional().or(z.string().optional()),
  NEXT_PUBLIC_API_URL: z.string().url().optional().or(z.string().optional()),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional().or(z.string().optional()),
  NEXT_PUBLIC_SENTRY_ENV: z.enum(['development', 'production', 'staging', 'test']).default('development'),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;
