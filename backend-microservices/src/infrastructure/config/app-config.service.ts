import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BackendEnv } from '../../common/utils/env-validation';

/**
 * AppConfigService — the single source of truth for all config in NestJS DI context.
 *
 * Rules:
 * - Every consumer of config MUST inject this service and call its typed getters.
 * - No other class may call `process.env.*` or `configService.get()` directly.
 * - All getters are non-nullable: validation already guarantees presence at boot.
 */
@Injectable()
export class AppConfigService {
  constructor(private readonly config: ConfigService<BackendEnv, true>) {}

  // ─── Runtime ───────────────────────────────────────────────────────────────
  get nodeEnv(): 'development' | 'production' | 'test' {
    return this.config.get('NODE_ENV', { infer: true });
  }

  get isProduction(): boolean {
    return this.nodeEnv === 'production';
  }

  get isDevelopment(): boolean {
    return this.nodeEnv === 'development';
  }

  get port(): number {
    return this.config.get('PORT', { infer: true });
  }

  // ─── Database ──────────────────────────────────────────────────────────────
  get databaseUrl(): string {
    return this.config.get('DATABASE_URL', { infer: true });
  }

  // ─── Redis ─────────────────────────────────────────────────────────────────
  get redisHost(): string {
    return this.config.get('REDIS_HOST', { infer: true });
  }

  get redisPort(): number | undefined {
    return this.config.get('REDIS_PORT', { infer: true });
  }

  get redisPassword(): string | undefined {
    return this.config.get('REDIS_PASSWORD', { infer: true });
  }

  // ─── JWT ───────────────────────────────────────────────────────────────────
  get jwtPrivateKey(): string {
    return this.config.get('JWT_PRIVATE_KEY', { infer: true });
  }

  get jwtPublicKey(): string {
    return this.config.get('JWT_PUBLIC_KEY', { infer: true });
  }

  get jwtSecret(): string {
    return this.config.get('JWT_SECRET', { infer: true });
  }

  get jwtKeyId(): string {
    return this.config.get('JWT_KEY_ID', { infer: true });
  }

  // ─── CORS ──────────────────────────────────────────────────────────────────
  get corsOrigin(): string {
    return this.config.get('CORS_ORIGIN', { infer: true });
  }

  get frontendUrl(): string {
    return this.config.get('FRONTEND_URL', { infer: true });
  }

  get allowedOrigins(): string[] {
    const raw = this.config.get('ALLOWED_ORIGINS', { infer: true });
    const frontend = this.frontendUrl;
    const origins = raw.split(',').map((o) => o.trim()).filter(Boolean);
    if (!origins.includes(frontend)) origins.push(frontend);
    return origins;
  }

  // ─── Better Auth ───────────────────────────────────────────────────────────
  get betterAuthSecret(): string {
    return this.config.get('BETTER_AUTH_SECRET', { infer: true });
  }

  get betterAuthUrl(): string {
    return this.config.get('BETTER_AUTH_URL', { infer: true });
  }

  // ─── Google OAuth ──────────────────────────────────────────────────────────
  get googleClientId(): string {
    return this.config.get('GOOGLE_CLIENT_ID', { infer: true });
  }

  get googleClientSecret(): string {
    return this.config.get('GOOGLE_CLIENT_SECRET', { infer: true });
  }

  // ─── Admin Bootstrap ───────────────────────────────────────────────────────
  get adminEmail(): string {
    return this.config.get('ADMIN_EMAIL', { infer: true });
  }

  get adminPassword(): string {
    return this.config.get('ADMIN_PASSWORD', { infer: true });
  }

  // ─── Mail ──────────────────────────────────────────────────────────────────
  get mailProvider(): 'console' | 'smtp' | 'ses' {
    return this.config.get('MAIL_PROVIDER', { infer: true });
  }

  get mailFrom(): string {
    return this.config.get('MAIL_FROM', { infer: true });
  }

  get smtpHost(): string | undefined {
    return this.config.get('SMTP_HOST', { infer: true });
  }

  get smtpPort(): number {
    return this.config.get('SMTP_PORT', { infer: true });
  }

  get smtpUser(): string | undefined {
    return this.config.get('SMTP_USER', { infer: true });
  }

  get smtpPass(): string | undefined {
    return this.config.get('SMTP_PASS', { infer: true });
  }

  get awsRegion(): string {
    return this.config.get('AWS_REGION', { infer: true });
  }

  get awsAccessKeyId(): string | undefined {
    return this.config.get('AWS_ACCESS_KEY_ID', { infer: true });
  }

  get awsSecretAccessKey(): string | undefined {
    return this.config.get('AWS_SECRET_ACCESS_KEY', { infer: true });
  }

  // ─── Rate Limiting ─────────────────────────────────────────────────────────
  get throttleTtlMs(): number {
    return this.config.get('THROTTLE_TTL_MS', { infer: true });
  }

  get throttleLimit(): number {
    return this.config.get('THROTTLE_LIMIT', { infer: true });
  }

  get throttleAuthTtlMs(): number {
    return this.config.get('THROTTLE_AUTH_TTL_MS', { infer: true });
  }

  get throttleAuthLimit(): number {
    return this.config.get('THROTTLE_AUTH_LIMIT', { infer: true });
  }
}
