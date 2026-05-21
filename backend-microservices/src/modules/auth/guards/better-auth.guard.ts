import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { auth } from '../bootstrap/better-auth.config';

export interface SessionUser {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  image: string | null;
  emailVerified: boolean;
  role: string;
  twoFactorEnabled: boolean;
  createdAt: string;
}

export interface AuthenticatedRequest extends FastifyRequest {
  user: SessionUser;
  session: {
    id: string;
    expiresAt: Date;
    token: string;
    createdAt: Date;
    updatedAt: Date;
    ipAddress: string | null;
    userAgent: string | null;
    userId: string;
    twoFactorVerified: boolean | null;
  };
}

@Injectable()
export class BetterAuthGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Support bypassing auth via @Public() decorator
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const headers = new Headers();

    // Map Fastify headers to Fetch Headers API for Better Auth compatibility
    Object.entries(request.headers).forEach(([key, val]) => {
      if (typeof val === 'string') {
        headers.set(key, val);
      } else if (Array.isArray(val)) {
        val.forEach((v) => headers.append(key, v));
      }
    });

    // 2. Fetch session from Better Auth
    const session = await auth.api.getSession({
      headers,
    });

    if (!session) {
      throw new UnauthorizedException('Authentication failed: Missing or invalid session');
    }

    // 2.1 Enforce Two-Factor verification if enabled
    const userObj = session.user as Record<string, unknown>;
    const sessionObj = session.session as { twoFactorVerified?: boolean | null };
    if (userObj['twoFactorEnabled'] === true && !sessionObj.twoFactorVerified) {
      throw new UnauthorizedException('Authentication failed: Two-Factor Verification required');
    }

    const fName =
      typeof userObj['firstName'] === 'string'
        ? userObj['firstName']
        : session.user.name || null;
    const lName = typeof userObj['lastName'] === 'string' ? userObj['lastName'] : null;
    const role = typeof userObj['role'] === 'string' ? userObj['role'] : 'CUSTOMER';
    const twoFactorEnabled = userObj['twoFactorEnabled'] === true;
    const createdAt =
      typeof userObj['createdAt'] === 'string'
        ? userObj['createdAt']
        : new Date().toISOString();

    request.user = {
      id: session.user.id,
      email: session.user.email,
      firstName: fName,
      lastName: lName,
      image: session.user.image ?? null,
      emailVerified: session.user.emailVerified,
      role,
      twoFactorEnabled,
      createdAt,
    };

    request.session = session.session;

    return true;
  }
}
