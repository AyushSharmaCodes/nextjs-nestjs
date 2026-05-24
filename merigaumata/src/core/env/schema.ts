import { z } from 'zod';

/**
 * Server-side only environment variables (never exposed to the browser).
 * These are read at build time and runtime on Node.js server.
 */
export const serverSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),

  // Internal API URL (server → backend, no browser exposure needed)
  NEXT_PUBLIC_API_URL: z.string().url('NEXT_PUBLIC_API_URL must be a valid URL'),

  // Optional integrations
  SENTRY_ORG: z.string().optional(),
  SENTRY_PROJECT: z.string().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),

  // Auth
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),

  // Logging
  LOG_FILE_PATH: z.string().optional(),
});

/**
 * Client-side environment variables (NEXT_PUBLIC_* prefix — sent to browser).
 * All required vars must be non-optional to cause build failure if missing.
 */
export const clientSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url('NEXT_PUBLIC_API_URL must be a valid URL'),
  NEXT_PUBLIC_APP_URL: z.string().url('NEXT_PUBLIC_APP_URL must be a valid URL'),

  // Sentry (optional — only in production setups)
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  NEXT_PUBLIC_SENTRY_ENV: z
    .enum(['development', 'production', 'staging', 'test'])
    .default('development'),
});

export type ServerEnv = z.infer<typeof serverSchema>;
export type ClientEnv = z.infer<typeof clientSchema>;
