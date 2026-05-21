/**
 * @file friendly-error.filter.ts
 *
 * Global exception filter — the single exit point for ALL unhandled errors.
 *
 * Handles (in order):
 *  1. AuthException (typed auth hierarchy) → uses errorCode registry + i18n
 *  2. PrismaClientKnownRequestError → maps Prisma codes to auth error codes
 *  3. PrismaClientValidationError → generic 500
 *  4. JWT errors (jose / jsonwebtoken) → AUTH_009/010
 *  5. Standard HttpException (NestJS built-ins, validation pipe, etc.)
 *  6. Unknown errors → generic 500
 *
 * SECURITY rules:
 *  - NEVER include stack traces in the response.
 *  - NEVER include raw Prisma error messages in the response.
 *  - NEVER include raw DB field names in the response.
 *  - requestId must be traceable to X-Trace-Id response header.
 *
 * Trade-off: The auth-specific AuthExceptionFilter is registered at the
 * module level and runs first for auth routes. This global filter is the
 * final fallback for everything else.
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { Logger } from 'nestjs-pino';
import { I18nService } from 'nestjs-i18n';
import { Prisma } from '@prisma/client';
import type { ApiErrorResponse } from '../types/api-response.type';
import { AuthException } from '../../modules/auth/exceptions/auth.exceptions';
import {
  AUTH_ERROR_CODES,
  AuthErrorCode,
  findAuthErrorKeyByCode,
} from '../../modules/auth/constants/error-codes.constant';

// ─────────────────────────────────────────────────────────────────────────────
// Prisma → AuthErrorCode mapping
// ─────────────────────────────────────────────────────────────────────────────

const PRISMA_CODE_MAP: Readonly<Partial<Record<string, AuthErrorCode>>> = {
  P2002: 'EMAIL_ALREADY_EXISTS',   // Unique constraint
  P2025: 'DB_WRITE_FAILED',        // Record not found
  P2003: 'DB_WRITE_FAILED',        // Foreign key constraint
  P2034: 'DB_WRITE_FAILED',        // Transaction conflict
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// Request type augment (tracing interceptor adds these)
// ─────────────────────────────────────────────────────────────────────────────

interface TracedRequest extends FastifyRequest {
  traceId?: string;
  correlationId?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Filter
// ─────────────────────────────────────────────────────────────────────────────

@Catch()
export class FriendlyErrorFilter implements ExceptionFilter {
  constructor(
    private readonly logger: Logger,
    private readonly i18n?: I18nService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<TracedRequest>();

    // Not an HTTP context (e.g. WebSocket / gRPC)
    if (!response?.status) return;

    // Better Auth (or another raw handler) already wrote the response
    if (response.sent) return;

    const requestId = request.traceId ?? generateFallbackId();
    const timestamp = new Date().toISOString();
    const path = request.url;
    const lang = resolveLanguage(request);

    // ── 1. AuthException (typed hierarchy) ──────────────────────────────
    if (exception instanceof AuthException) {
      const message = this.resolveI18n(exception.i18nKey, lang, exception.meta);
      const body: ApiErrorResponse = {
        success: false,
        errorCode: exception.code,
        message,
        statusCode: exception.httpStatus,
        timestamp,
        path,
        requestId,
        meta: exception.meta,
      };
      this.logWarn(request, body.statusCode, message, requestId);
      response.status(exception.httpStatus).send(body);
      return;
    }

    // ── 2. Prisma known errors ──────────────────────────────────────────
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const authKey = PRISMA_CODE_MAP[exception.code] ?? 'DB_WRITE_FAILED';
      const descriptor = AUTH_ERROR_CODES[authKey];
      const message = this.resolveI18n(descriptor.i18nKey, lang);
      this.logError(request, descriptor.httpStatus, `Prisma[${exception.code}]`, requestId);
      const body: ApiErrorResponse = {
        success: false,
        errorCode: descriptor.code,
        message,
        statusCode: descriptor.httpStatus,
        timestamp,
        path,
        requestId,
      };
      response.status(descriptor.httpStatus).send(body);
      return;
    }

    // ── 3. Prisma validation error ──────────────────────────────────────
    if (exception instanceof Prisma.PrismaClientValidationError) {
      const descriptor = AUTH_ERROR_CODES.DB_WRITE_FAILED;
      const message = this.resolveI18n(descriptor.i18nKey, lang);
      this.logError(request, 500, 'PrismaValidationError', requestId);
      const body: ApiErrorResponse = {
        success: false,
        errorCode: descriptor.code,
        message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        timestamp,
        path,
        requestId,
      };
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(body);
      return;
    }

    // ── 4. JWT errors ───────────────────────────────────────────────────
    if (isJwtError(exception)) {
      const authKey: AuthErrorCode = isExpiredJwtError(exception)
        ? 'TOKEN_EXPIRED'
        : 'TOKEN_INVALID';
      const descriptor = AUTH_ERROR_CODES[authKey];
      const message = this.resolveI18n(descriptor.i18nKey, lang);
      this.logWarn(request, descriptor.httpStatus, 'JWT error', requestId);
      const body: ApiErrorResponse = {
        success: false,
        errorCode: descriptor.code,
        message,
        statusCode: descriptor.httpStatus,
        timestamp,
        path,
        requestId,
      };
      response.status(descriptor.httpStatus).send(body);
      return;
    }

    // ── 5. Standard HttpException (NestJS built-ins) ────────────────────
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      let errorCode = deriveCodeFromStatus(status);
      let message = this.resolveI18n(`http.${status}`, lang);
      let details: ApiErrorResponse['details'];

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resp = exceptionResponse as Record<string, unknown>;

        // Check for typed errorCode from AuthException nested inside HttpException
        if (typeof resp['errorCode'] === 'string') {
          const knownKey = findAuthErrorKeyByCode(resp['errorCode']);
          if (knownKey) {
            errorCode = AUTH_ERROR_CODES[knownKey].code;
            const i18nKey = AUTH_ERROR_CODES[knownKey].i18nKey;
            message = this.resolveI18n(i18nKey, lang);
          }
        }

        // Zod / class-validator validation errors
        if (Array.isArray(resp['message'])) {
          message = this.resolveI18n('common.errors.validationFailed', lang);
          details = (resp['message'] as string[]).map((msg) => ({
            message: msg,
            field: extractField(msg),
            code: 'INVALID_FIELD',
          }));
        } else if (typeof resp['message'] === 'string' && !message) {
          message = resp['message'];
        }
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      }

      const body: ApiErrorResponse = {
        success: false,
        errorCode,
        message,
        statusCode: status,
        timestamp,
        path,
        requestId,
        ...(details ? { details } : {}),
      };

      if (status >= 500) {
        this.logError(request, status, 'HttpException', requestId);
      } else {
        this.logWarn(request, status, message, requestId);
      }
      response.status(status).send(body);
      return;
    }

    // ── 6. Unknown / unhandled ──────────────────────────────────────────
    this.logError(request, 500, 'UnhandledException', requestId);
    const body: ApiErrorResponse = {
      success: false,
      errorCode: 'INTERNAL_ERROR',
      message: this.resolveI18n('common.errors.unexpectedError', lang),
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      timestamp,
      path,
      requestId,
    };
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).send(body);
  }

  // ─────────────────────────────────────────────────────────────────────
  // Private helpers
  // ─────────────────────────────────────────────────────────────────────

  private resolveI18n(
    key: string,
    lang: string,
    args?: Readonly<Record<string, string | number>>,
  ): string {
    if (!this.i18n) return key;
    try {
      const resolved = this.i18n.translate(key, {
        lang,
        args: args as Record<string, unknown>,
      });
      return typeof resolved === 'string' ? resolved : key;
    } catch {
      return key;
    }
  }

  private logWarn(
    req: TracedRequest,
    status: number,
    message: string,
    requestId: string,
  ): void {
    this.logger.warn({
      message,
      path: req.url,
      method: req.method,
      statusCode: status,
      requestId,
      traceId: req.traceId,
      correlationId: req.correlationId,
    });
  }

  private logError(
    req: TracedRequest,
    status: number,
    type: string,
    requestId: string,
  ): void {
    this.logger.error({
      type,
      path: req.url,
      method: req.method,
      statusCode: status,
      requestId,
      traceId: req.traceId,
      correlationId: req.correlationId,
    }, `Server error: ${type}`);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Standalone utility functions (no this dependency)
// ─────────────────────────────────────────────────────────────────────────────

function resolveLanguage(req: FastifyRequest): string {
  const header = req.headers['accept-language'];
  if (!header) return 'en';
  const primary = header.split(',')[0]?.split('-')[0]?.trim();
  const supported = ['en', 'hi', 'ta', 'te'];
  return primary && supported.includes(primary) ? primary : 'en';
}

function generateFallbackId(): string {
  return `fallback-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function deriveCodeFromStatus(status: number): string {
  if (status === 401) return AUTH_ERROR_CODES.TOKEN_INVALID.code;
  if (status === 403) return AUTH_ERROR_CODES.ACCOUNT_DISABLED.code;
  if (status === 409) return AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS.code;
  if (status === 410) return AUTH_ERROR_CODES.OTP_EXPIRED.code;
  if (status === 423) return AUTH_ERROR_CODES.ACCOUNT_LOCKED.code;
  if (status >= 500) return AUTH_ERROR_CODES.DB_WRITE_FAILED.code;
  return `HTTP_${status}`;
}

function isJwtError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as Record<string, unknown>;
  const name = e['name'];
  return (
    name === 'JWSInvalid' ||
    name === 'JWTExpired' ||
    name === 'JWTClaimValidationFailed' ||
    name === 'JsonWebTokenError' ||
    name === 'TokenExpiredError' ||
    name === 'NotBeforeError'
  );
}

function isExpiredJwtError(err: unknown): boolean {
  if (!err || typeof err !== 'object') return false;
  const e = err as Record<string, unknown>;
  return e['name'] === 'JWTExpired' || e['name'] === 'TokenExpiredError';
}

/**
 * Extract the first word of a validation error message as the field name.
 * e.g. "email must be a valid email" → "email"
 */
function extractField(msg: string): string | null {
  const firstWord = msg.split(' ')[0];
  return firstWord ?? null;
}
