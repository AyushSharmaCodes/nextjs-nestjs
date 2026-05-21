import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppConfigService } from '../../infrastructure/config/app-config.service';
import { IS_PUBLIC_KEY } from '../../modules/auth/decorators/public.decorator';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

function normalizeOrigin(origin: string | null | undefined): string | null {
  if (!origin) return null;
  try {
    return new URL(origin).origin;
  } catch {
    return null;
  }
}

/**
 * CSRF guard — protects cookie-authenticated state-mutating requests.
 * Uses NestJS built-in Logger (not Pino) so it works as a global APP_GUARD
 * without needing LoggerModule to be resolvable in AppModule context.
 */
@Injectable()
export class CsrfGuard implements CanActivate {
  private readonly logger = new Logger(CsrfGuard.name);

  constructor(
    private readonly appConfig: AppConfigService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    // Skip for routes marked @Public() (e.g. AuthController)
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    // Also skip if the path starts with /api/auth (Better Auth owns these)
    if (typeof req.url === 'string' && req.url.startsWith('/api/auth')) return true;

    // Safe methods don't mutate state
    if (SAFE_METHODS.has(req.method)) return true;

    // Only enforce on cookie-authenticated requests (Better Auth uses __Host-session)
    const hasCookieAuth = Boolean(req.cookies?.['__Host-session']);
    if (!hasCookieAuth) return true;

    const allowedOrigins = this.getAllowedOrigins();

    if (allowedOrigins.length === 0) {
      this.logger.error('CSRF protection misconfigured: no ALLOWED_ORIGINS set');
      throw new InternalServerErrorException('Server configuration error');
    }

    const requestOrigin = normalizeOrigin(req.headers.origin as string);
    const refererOrigin = normalizeOrigin(req.headers.referer as string);
    const sourceOrigin = requestOrigin || refererOrigin;

    if (!sourceOrigin || !allowedOrigins.includes(sourceOrigin)) {
      this.logger.warn(
        `Blocked cookie-authenticated CSRF attempt: ${req.method} ${req.url} from ${requestOrigin ?? refererOrigin}`,
      );
      throw new ForbiddenException({
        message: 'Forbidden',
        code: 'CSRF_ORIGIN_MISMATCH',
      });
    }

    return true;
  }

  private getAllowedOrigins(): string[] {
    // AppConfigService.allowedOrigins already merges ALLOWED_ORIGINS + FRONTEND_URL and normalizes
    return this.appConfig.allowedOrigins
      .map((o) => normalizeOrigin(o))
      .filter((o): o is string => Boolean(o));
  }
}
