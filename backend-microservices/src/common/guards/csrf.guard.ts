import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

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

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();

    // Safe methods don't mutate state
    if (SAFE_METHODS.has(req.method)) return true;

    // Only enforce on cookie-authenticated requests
    const hasCookieAuth =
      Boolean(req.cookies?.access_token) || Boolean(req.cookies?.refresh_token);
    if (!hasCookieAuth) return true;

    const allowedOrigins = this.getAllowedOrigins();

    if (allowedOrigins.length === 0) {
      this.logger.error('CSRF protection misconfigured: no ALLOWED_ORIGINS set');
      throw new InternalServerErrorException('Server configuration error');
    }

    const requestOrigin = normalizeOrigin(req.get('origin'));
    const refererOrigin = normalizeOrigin(req.get('referer'));
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
    const rawOrigins = this.configService.get<string>('ALLOWED_ORIGINS', '');
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', '');

    const origins = rawOrigins
      .split(',')
      .map((o) => normalizeOrigin(o.trim()))
      .filter((o): o is string => Boolean(o));

    const frontend = normalizeOrigin(frontendUrl);
    if (frontend && !origins.includes(frontend)) {
      origins.push(frontend);
    }

    return origins;
  }
}
