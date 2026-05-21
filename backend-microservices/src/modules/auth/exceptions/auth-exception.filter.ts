/**
 * @file auth-exception.filter.ts
 *
 * Dedicated exception filter for the auth module.
 * Registered alongside the global FriendlyErrorFilter.
 *
 * Catches:
 *  - AuthException (our typed hierarchy)
 *  - Prisma P2002/P2025 errors from the auth repository
 *  - JsonWebTokenError / TokenExpiredError from jose / jsonwebtoken
 *
 * Returns: strictly typed ApiErrorResponse — no stack traces, no raw DB errors.
 *
 * i18n resolution: uses Accept-Language header (via AcceptLanguageResolver).
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { FastifyRequest, FastifyReply } from 'fastify';
import { I18nService, I18nContext } from 'nestjs-i18n';
import { Prisma } from '@prisma/client';
import { AuthException } from './auth.exceptions';
import {
  AUTH_ERROR_CODES,
  AuthErrorCode,
  findAuthErrorKeyByCode,
} from '../constants/error-codes.constant';
import type { ApiErrorResponse } from '../../../common/types/api-response.type';

interface TracedRequest extends FastifyRequest {
  traceId?: string;
  correlationId?: string;
}

// ---------------------------------------------------------------------------
// Prisma error code → AuthErrorCode mapping
// ---------------------------------------------------------------------------

/**
 * Maps Prisma known error codes to our AUTH registry keys.
 * Only the codes relevant to auth flows are listed.
 *
 * Trade-off: We only map a subset. Unknown Prisma errors fall back to a
 * generic 500 — this is correct because we don't want to leak DB internals.
 */
const PRISMA_TO_AUTH_CODE: Readonly<Partial<Record<string, AuthErrorCode>>> = {
  P2002: 'EMAIL_ALREADY_EXISTS',   // Unique constraint violation (email)
  P2025: 'DB_WRITE_FAILED',        // Record not found on update/delete
  P2003: 'DB_WRITE_FAILED',        // Foreign key constraint failed
  P2034: 'DB_WRITE_FAILED',        // Transaction conflict
} as const;

// ---------------------------------------------------------------------------
// Filter
// ---------------------------------------------------------------------------

@Catch()
export class AuthExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AuthExceptionFilter.name);

  constructor(private readonly i18n: I18nService) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<FastifyReply>();
    const request = ctx.getRequest<TracedRequest>();

    // Already written (e.g. Better Auth's toNodeHandler wrote it)
    if (response.sent) {
      return;
    }

    const requestId = request.traceId ?? generateFallbackId();
    const timestamp = new Date().toISOString();
    const path = request.url;
    const lang = resolveLanguage(request);

    // ── AuthException (our hierarchy) ──────────────────────────────────────
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
      this.logWarn(exception, request, requestId);
      response.status(exception.httpStatus).send(body);
      return;
    }

    // ── Prisma known errors ────────────────────────────────────────────────
    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      const authKey = PRISMA_TO_AUTH_CODE[exception.code] ?? 'DB_WRITE_FAILED';
      const descriptor = AUTH_ERROR_CODES[authKey];
      const message = this.resolveI18n(descriptor.i18nKey, lang);

      this.logError(exception, request, requestId, `Prisma[${exception.code}]`);

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

    // ── Prisma validation errors (bad queries — should never reach prod) ──
    if (exception instanceof Prisma.PrismaClientValidationError) {
      const descriptor = AUTH_ERROR_CODES['DB_WRITE_FAILED'];
      const message = this.resolveI18n(descriptor.i18nKey, lang);
      this.logError(exception, request, requestId, 'PrismaValidationError');
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

    // ── JWT errors from jose / jsonwebtoken ───────────────────────────────
    if (isJwtError(exception)) {
      const isExpiry = isExpiredJwtError(exception);
      const authKey: AuthErrorCode = isExpiry ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID';
      const descriptor = AUTH_ERROR_CODES[authKey];
      const message = this.resolveI18n(descriptor.i18nKey, lang);
      this.logWarn(exception as Error, request, requestId);
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

    // ── Standard HttpException (NestJS built-ins) ─────────────────────────
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      let errorCode = deriveCodeFromStatus(status);
      let message = '';

      // Check if our filter already set a typed code (e.g. from nested AuthException)
      if (
        typeof exceptionResponse === 'object' &&
        exceptionResponse !== null
      ) {
        const resp = exceptionResponse as Record<string, unknown>;
        if (typeof resp['errorCode'] === 'string') {
          const knownKey = findAuthErrorKeyByCode(resp['errorCode']);
          if (knownKey) {
            errorCode = AUTH_ERROR_CODES[knownKey].code;
            message = this.resolveI18n(AUTH_ERROR_CODES[knownKey].i18nKey, lang);
          }
        }
        if (!message) {
          message = typeof resp['message'] === 'string'
            ? resp['message']
            : this.resolveI18n(`http.${status}`, lang);
        }
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      }

      const body: ApiErrorResponse = {
        success: false,
        errorCode,
        message: message || 'An error occurred',
        statusCode: status,
        timestamp,
        path,
        requestId,
      };

      if (status >= 500) {
        this.logError(exception, request, requestId, 'HttpException');
      } else {
        this.logWarn(exception, request, requestId);
      }
      response.status(status).send(body);
      return;
    }

    // ── Unknown / unhandled ───────────────────────────────────────────────
    this.logError(exception as Error, request, requestId, 'UnhandledException');
    const descriptor = AUTH_ERROR_CODES['DB_WRITE_FAILED'];
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

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  private resolveI18n(
    key: string,
    lang: string,
    args?: Readonly<Record<string, string | number>>,
  ): string {
    try {
      const resolved = this.i18n.translate(key, {
        lang,
        args: args as Record<string, unknown>,
      });
      return typeof resolved === 'string' ? resolved : key;
    } catch {
      // i18n key missing — return the key itself so engineers can find it
      return key;
    }
  }

  private logWarn(
    err: Error | unknown,
    req: TracedRequest,
    requestId: string,
  ): void {
    const msg = err instanceof Error ? err.message : String(err);
    this.logger.warn({
      message: msg,
      path: req.url,
      method: req.method,
      requestId,
    });
  }

  private logError(
    err: Error | unknown,
    req: TracedRequest,
    requestId: string,
    type: string,
  ): void {
    // NEVER log the full stack to client — only to server logs
    this.logger.error({
      type,
      message: err instanceof Error ? err.message : String(err),
      path: req.url,
      method: req.method,
      requestId,
      // stack is logged server-side only, not sent to client
    });
  }
}

// ---------------------------------------------------------------------------
// Utility functions
// ---------------------------------------------------------------------------

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
  return `HTTP_${status}`;
}

/** Type-guard for JWT errors from jose / jsonwebtoken / better-auth */
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
