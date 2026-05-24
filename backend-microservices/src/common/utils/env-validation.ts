import { z } from 'zod';
import { Logger } from '@nestjs/common';

/**
 * Complete Zod schema for all backend environment variables.
 * Every variable used anywhere in the backend must be declared here.
 * Required variables WILL cause a process.exit(1) at startup if missing.
 */
export const BackendEnvSchema = z.object({
  // ─── Runtime ───────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z
    .string()
    .transform(Number)
    .refine(n => n > 0 && n < 65536, 'PORT must be a valid port number')
    .default(5001),

  // ─── Database ──────────────────────────────────────────────────────────────
  DATABASE_URL: z.string().url('DATABASE_URL must be a valid URL'),

  // ─── Redis ─────────────────────────────────────────────────────────────────
  REDIS_HOST: z.string().min(1, 'REDIS_HOST is required'),
  REDIS_PORT: z.string().transform(Number).optional(),
  REDIS_PASSWORD: z.string().optional(),

  // ─── JWT (RS256) ───────────────────────────────────────────────────────────
  JWT_PRIVATE_KEY: z.string().min(1, 'JWT_PRIVATE_KEY is required'),
  JWT_PUBLIC_KEY: z.string().min(1, 'JWT_PUBLIC_KEY is required'),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_KEY_ID: z.string().default('auth-local-v1'),

  // ─── CORS / Origins ────────────────────────────────────────────────────────
  CORS_ORIGIN: z.string().min(1, 'CORS_ORIGIN is required'),
  FRONTEND_URL: z.string().url('FRONTEND_URL must be a valid URL'),
  ALLOWED_ORIGINS: z.string().min(1, 'ALLOWED_ORIGINS is required'),

  // ─── Better Auth ───────────────────────────────────────────────────────────
  BETTER_AUTH_SECRET: z.string().min(32, 'BETTER_AUTH_SECRET must be at least 32 characters'),
  BETTER_AUTH_URL: z.string().url('BETTER_AUTH_URL must be a valid URL'),

  // ─── Google OAuth ──────────────────────────────────────────────────────────
  GOOGLE_CLIENT_ID: z.string().min(1, 'GOOGLE_CLIENT_ID is required'),
  GOOGLE_CLIENT_SECRET: z.string().min(1, 'GOOGLE_CLIENT_SECRET is required'),

  // ─── Admin Bootstrap ───────────────────────────────────────────────────────
  ADMIN_EMAIL: z.string().email('ADMIN_EMAIL must be a valid email'),
  ADMIN_PASSWORD: z.string().min(12, 'ADMIN_PASSWORD must be at least 12 characters'),

  // ─── Mail ──────────────────────────────────────────────────────────────────
  MAIL_PROVIDER: z.enum(['console', 'smtp', 'ses']).default('console'),
  MAIL_FROM: z.string().min(1, 'MAIL_FROM is required'),

  // SMTP (required when MAIL_PROVIDER=smtp)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().transform(Number).default(587),
  SMTP_SECURE: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM_NAME: z.string().optional(),
  SMTP_FROM_EMAIL: z.string().optional(),
  SMTP_FORCE_IPV4: z.string().optional(),

  // AWS SES (required when MAIL_PROVIDER=ses)
  AWS_REGION: z.string().default('ap-south-1'),
  AWS_ACCESS_KEY_ID: z.string().optional(),
  AWS_SECRET_ACCESS_KEY: z.string().optional(),

  // ─── Supabase ─────────────────────────────────────────────────────────────────
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1, 'SUPABASE_SERVICE_ROLE_KEY is required'),

  // ─── Rate Limiting ─────────────────────────────────────────────────────────
  THROTTLE_TTL_MS: z.string().transform(Number).default(900000),
  THROTTLE_LIMIT: z.string().transform(Number).default(1000),
  THROTTLE_AUTH_TTL_MS: z.string().transform(Number).default(900000),
  THROTTLE_AUTH_LIMIT: z.string().transform(Number).default(20),

  // ─── Country State City API ───────────────────────────────────────────────
  COUNTRY_API_BASE_URL: z.string().url('COUNTRY_API_BASE_URL must be a valid URL'),
  COUNTRY_API_KEY: z.string().min(1, 'COUNTRY_API_KEY is required'),

  // ─── Cron Security ────────────────────────────────────────────────────────
  CRON_SECRET: z.string().min(1, 'CRON_SECRET is required'),

  // ─── NVIDIA NIM ───────────────────────────────────────────
  NVIDIA_NIM_BASE_URL: z
    .string()
    .url('NVIDIA_NIM_BASE_URL must be a valid URL')
    .default('https://integrate.api.nvidia.com/v1'),
  NVIDIA_NIM_API_KEY: z.string().min(1, 'NVIDIA_NIM_API_KEY is required'),
  NVIDIA_NIM_DEFAULT_MODEL: z.string().default('openai/gpt-oss-120b'),
  NVIDIA_NIM_MAX_TOKENS: z.string().transform(Number).default(2048),
  NVIDIA_NIM_TIMEOUT_MS: z.string().transform(Number).default(30000),
  NVIDIA_NIM_TEMPERATURE: z.string().transform(Number).default(0.7),
});

export type BackendEnv = z.infer<typeof BackendEnvSchema>;

/**
 * Validates all environment variables using the schema.
 * Called by AppConfigModule at startup via ConfigModule.forRoot({ validate }).
 * Crashes the process on the first validation failure — fail loudly.
 */
export function validateEnvironment(config: Record<string, unknown>): BackendEnv {
  const logger = new Logger('EnvValidation');
  const result = BackendEnvSchema.safeParse(config);

  if (!result.success) {
    const formatted = result.error.issues.map(issue => `  • ${issue.path.join('.')}: ${issue.message}`).join('\n');
    logger.error(`\n❌ Environment validation failed:\n${formatted}\n`);
    process.exit(1);
  }

  // Cross-field validation: warn if SMTP vars are missing when MAIL_PROVIDER=smtp
  if (result.data.MAIL_PROVIDER === 'smtp' && !result.data.SMTP_HOST) {
    logger.error('\n❌ MAIL_PROVIDER=smtp but SMTP_HOST is not set\n');
    process.exit(1);
  }

  if (result.data.MAIL_PROVIDER === 'ses' && (!result.data.AWS_ACCESS_KEY_ID || !result.data.AWS_SECRET_ACCESS_KEY)) {
    logger.error('\n❌ MAIL_PROVIDER=ses but AWS_ACCESS_KEY_ID or AWS_SECRET_ACCESS_KEY is not set\n');
    process.exit(1);
  }

  return result.data;
}
