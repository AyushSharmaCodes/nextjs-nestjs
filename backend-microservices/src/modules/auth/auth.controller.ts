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
import { toNodeHandler } from 'better-auth/node';
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

const betterAuthHandler = toNodeHandler(auth);

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
    const userId = req.user?.id;

    if (!userId) {
      throw new TokenInvalidException();
    }

    return this.authService.getAuthContext(toUserId(userId));
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
    return new Promise<void>((resolve) => {
      const rawRes = res.raw;
      const rawReq = req.raw;
      // Wrap res.raw.end to resolve the Promise when Better Auth finishes writing
      const originalEnd = rawRes.end.bind(rawRes) as typeof rawRes.end;
      rawRes.end = function overriddenEnd(
        chunk?: Parameters<typeof rawRes.end>[0],
        encodingOrCb?: Parameters<typeof rawRes.end>[1],
        cb?: Parameters<typeof rawRes.end>[2],
      ): typeof rawRes {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- necessary for res.end overloads
        (originalEnd as (...a: unknown[]) => void)(chunk, encodingOrCb, cb);
        resolve();
        return rawRes;
      } as typeof rawRes.end;

      betterAuthHandler(rawReq, rawRes).catch((err: unknown) => {
        const message = err instanceof Error ? err.message : String(err);
        this.logger.error({ err }, `Better Auth handler threw: ${message}`);
        if (!rawRes.headersSent) {
          // Return typed error shape even for BA internal failures using Fastify reply
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
        resolve();
      });
    });
  }
}
