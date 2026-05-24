/**
 * @file better-auth.guard.ts
 *
 * Global authentication guard for all non-@Public() routes.
 *
 * Auth architecture:
 *  - Session is carried exclusively in the `__Host-session` HTTP-only cookie.
 *  - No Authorization header, no Bearer token, no localStorage.
 *  - Better Auth validates the cookie and returns a typed session object.
 *  - The guard populates `request.user` and `request.session` for downstream
 *    handlers and the RolesGuard.
 *
 * 2FA enforcement:
 *  - If `twoFactorEnabled=true` and `twoFactorVerified=false` on the session,
 *    the request is rejected with TOKEN_INVALID (AUTH_010).
 *  - The frontend must complete 2FA verification at /auth/verify before
 *    accessing protected routes.
 */

import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { FastifyRequest } from 'fastify';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { auth } from '../bootstrap/better-auth.config';
import {
  TokenInvalidException,
  TokenExpiredException,
} from '../exceptions/auth.exceptions';

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
  lastLoginAt: string | null;
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
    // Routes decorated with @Public() bypass this guard entirely
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) return true;

    const request = context.switchToHttp().getRequest<FastifyRequest>();

    // Forward Fastify headers to the Fetch Headers API that Better Auth expects
    const headers = new Headers();
    for (const [key, val] of Object.entries(request.headers)) {
      if (typeof val === 'string') {
        headers.set(key, val);
      } else if (Array.isArray(val)) {
        for (const v of val) headers.append(key, v);
      }
    }

    // Validate the __Host-session cookie via Better Auth
    const session = await auth.api.getSession({ headers });

    if (!session) {
      // No cookie present or cookie is invalid/expired
      throw new TokenInvalidException();
    }

    // Check if the session itself has expired (belt-and-suspenders — BA should
    // already reject expired sessions, but we guard explicitly for HIGH_RISK
    // revocations where we set expiresAt = epoch rather than deleting the row)
    if (session.session.expiresAt < new Date()) {
      throw new TokenExpiredException();
    }

    // Enforce 2FA: if the user has 2FA enabled, the session must be verified
    // We double cast through unknown because Better Auth's standard user object is less structured than our custom SessionUser.
    const userObj = session.user as unknown as Partial<SessionUser>;
    const sessionObj = session.session as { twoFactorVerified?: boolean | null };
    const twoFactorEnabled = userObj.twoFactorEnabled === true;

    if (twoFactorEnabled && !sessionObj.twoFactorVerified) {
      // Return 401 with the typed TOKEN_INVALID code so the frontend can
      // redirect to /auth/verify rather than showing a generic error
      throw new TokenInvalidException({ reason: '2fa-required' });
    }

    // Populate request.user and request.session for downstream handlers
    const fName =
      typeof userObj.firstName === 'string'
        ? userObj.firstName
        : typeof session.user.name === 'string'
          ? session.user.name
          : null;
    const lName =
      typeof userObj.lastName === 'string' ? userObj.lastName : null;
    const role =
      typeof userObj.role === 'string' ? userObj.role : 'CUSTOMER';
    const createdAt =
      typeof userObj.createdAt === 'string'
        ? userObj.createdAt
        : new Date().toISOString();
    const lastLoginAt =
      typeof userObj.lastLoginAt === 'string'
        ? userObj.lastLoginAt
        : null;

    // We double cast through unknown to safely attach the strongly-typed authenticated user context to the incoming NestJS request object.
    (request as unknown as AuthenticatedRequest).user = {
      id: session.user.id,
      email: session.user.email,
      firstName: fName,
      lastName: lName,
      image: session.user.image ?? null,
      emailVerified: session.user.emailVerified,
      role,
      twoFactorEnabled,
      createdAt,
      lastLoginAt,
    };

    // We double cast through unknown to safely attach the strongly-typed session context to the incoming NestJS request object.
    (request as unknown as AuthenticatedRequest).session = {
      id:                session.session.id,
      expiresAt:         session.session.expiresAt,
      token:             session.session.token,
      createdAt:         session.session.createdAt,
      updatedAt:         session.session.updatedAt,
      userId:            session.session.userId,
      ipAddress:         session.session.ipAddress ?? null,
      userAgent:         session.session.userAgent ?? null,
      twoFactorVerified: sessionObj.twoFactorVerified ?? null,
    };

    return true;
  }
}
