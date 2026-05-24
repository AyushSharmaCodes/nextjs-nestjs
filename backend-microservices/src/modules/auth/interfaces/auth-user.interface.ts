/**
 * @file auth-user.interface.ts
 *
 * The canonical "auth user" shape that flows through the NestJS layer.
 * This is NOT the raw Prisma User model — it is the shape AFTER the
 * AuthMapper has stripped sensitive fields and branded the IDs.
 *
 * Attached to `request.user` by BetterAuthGuard.
 */

import type { UserId, UserRole } from '../types/auth.types';

/**
 * The user object attached to every authenticated Fastify request
 * after BetterAuthGuard validates the session.
 */
export interface AuthUser {
  readonly id: UserId;
  readonly email: string;
  readonly firstName: string | null;
  readonly lastName: string | null;
  readonly image: string | null;
  readonly emailVerified: boolean;
  readonly role: UserRole;
  readonly twoFactorEnabled: boolean;
  readonly lastLoginAt?: string | null;
}

/**
 * Type guard — confirms that an object is a valid AuthUser.
 * Use in controllers / guards before accessing `request.user`.
 */
export function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.id === 'string' && typeof v.email === 'string' && typeof v.emailVerified === 'boolean';
}
