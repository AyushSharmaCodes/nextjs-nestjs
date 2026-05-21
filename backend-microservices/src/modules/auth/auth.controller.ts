/**
 * @file auth.controller.ts
 *
 * Route handlers ONLY — no business logic.
 *
 * Routes:
 *  - ALL /api/auth/* → catch-all delegated to Better Auth's toNodeHandler
 *    (handles sign-in, sign-up, magic-link, OTP, Google OAuth, etc.)
 *  - GET /api/auth/me → typed endpoint returning AuthResponseDto
 *
 * The /me route is the only one we own; everything else is Better Auth's.
 *
 * Error handling:
 *  - Better Auth errors caught and re-thrown as AuthExceptions (in service).
 *  - The AuthExceptionFilter on the module handles all error formatting.
 */

import {
  All,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Req,
  Res,
  UseFilters,
} from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { FastifyRequest, FastifyReply } from 'fastify';
import { auth } from './bootstrap/better-auth.config';
import { Public } from './decorators/public.decorator';
import { AuthService } from './auth.service';
import { AuthExceptionFilter } from './exceptions/auth-exception.filter';
import { toUserId } from './types/auth.types';
import type { AuthResponseDto } from './dto/response/auth.response.dto';
import { TokenInvalidException } from './exceptions/auth.exceptions';
import type { SessionUser } from './guards/better-auth.guard';

interface AuthenticatedFastifyRequest extends FastifyRequest {
  user: SessionUser;
  session: {
    id: string;
    token: string;
    expiresAt: Date;
    twoFactorVerified: boolean | null;
  };
}

@UseFilters(AuthExceptionFilter)
@Controller('api/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  // ─────────────────────────────────────────────────────────────────────────
  // Typed application routes
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/auth/me
   *
   * Returns the full auth context for the currently authenticated user.
   * BetterAuthGuard has already validated the session and populated request.user.
   *
   * Response: AuthResponseDto (no raw tokens, no sensitive fields).
   */
  @Get('me')
  @HttpCode(HttpStatus.OK)
  async getMe(
    @Req() req: AuthenticatedFastifyRequest,
  ): Promise<AuthResponseDto> {
    if (!req.user?.id || !req.session?.id) {
      throw new TokenInvalidException();
    }

    return this.authService.buildAuthResponseFromRawSession({
      userId: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      image: req.user.image,
      role: req.user.role,
      emailVerified: req.user.emailVerified,
      twoFactorEnabled: req.user.twoFactorEnabled,
      sessionId: req.session.id,
      tokenExpiresAt: req.session.expiresAt,
      twoFactorVerified: req.user.twoFactorEnabled
        ? req.session.twoFactorVerified ?? false
        : true,
      createdAt: req.user.createdAt,
    });
  }

  // ─────────────────────────────────────────────────────────────────────────
  // Better Auth catch-all (handles all auth protocol routes)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * ALL /api/auth/*
   *
   * Delegates all other auth routes (sign-in, sign-up, magic-link, OTP,
   * Google OAuth callbacks, 2FA, password-reset, etc.) to Better Auth.
   *
   * @SkipThrottle — Better Auth has its own per-route rate limiting.
   * @Public — BetterAuthGuard must NOT run on these routes; BA handles auth.
   */
  @SkipThrottle()
  @Public()
  @All('*')
  catchAll(
    @Req() req: FastifyRequest,
    @Res() res: FastifyReply,
  ): Promise<void> {
    return this.forwardToBetterAuth(req, res);
  }

  private async forwardToBetterAuth(
    req: FastifyRequest,
    res: FastifyReply,
  ): Promise<void> {
    try {
      const request = this.toWebRequest(req);
      const response = await auth.handler(request);

      res.status(response.status);
      this.copyResponseHeaders(response.headers, res);

      const body = Buffer.from(await response.arrayBuffer());
      res.send(body);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error({ err }, `Better Auth handler threw: ${message}`);

      if (!res.sent) {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          success: false,
          errorCode: 'AUTH_050',
          message: 'Authentication service error',
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
          timestamp: new Date().toISOString(),
          path: req.url,
          requestId: (req as FastifyRequest & { traceId?: string }).traceId ?? 'unknown',
        });
      }
    }
  }

  private toWebRequest(req: FastifyRequest): Request {
    const protocol = req.protocol || 'http';
    const host = req.headers.host ?? 'localhost';
    const url = `${protocol}://${host}${req.url}`;

    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (Array.isArray(value)) {
        for (const item of value) headers.append(key, item);
      } else if (value !== undefined) {
        headers.set(key, String(value));
      }
    }

    const method = req.method.toUpperCase();
    const init: RequestInit = { method, headers };

    if (method !== 'GET' && method !== 'HEAD') {
      init.body = this.serializeRequestBody(req.body);
    }

    return new Request(url, init);
  }

  private serializeRequestBody(body: unknown): BodyInit | undefined {
    if (body === undefined || body === null) {
      return undefined;
    }
    if (typeof body === 'string' || body instanceof URLSearchParams || body instanceof Blob) {
      return body;
    }
    if (Buffer.isBuffer(body)) {
      return body.buffer.slice(
        body.byteOffset,
        body.byteOffset + body.byteLength,
      ) as ArrayBuffer;
    }
    return JSON.stringify(body);
  }

  private copyResponseHeaders(headers: Headers, res: FastifyReply): void {
    const headerWithCookies = headers as Headers & {
      getSetCookie?: () => string[];
    };
    const setCookies = headerWithCookies.getSetCookie?.() ?? [];

    headers.forEach((value, key) => {
      if (key.toLowerCase() === 'set-cookie') {
        return;
      }
      res.header(key, value);
    });

    if (setCookies.length > 0) {
      res.header('set-cookie', setCookies);
      return;
    }

    const setCookie = headers.get('set-cookie');
    if (setCookie) {
      res.header('set-cookie', setCookie);
    }
  }
}
