'use server';

import { cookies } from 'next/headers';
import { StrictUser } from '../hooks/useStrictAuth';
import { serverEnv } from '@/core/env/server';
import { authLogger } from '@/shared/lib/logger';
import { extractAuthResponseData } from '../lib/auth-response';

const API_URL = serverEnv.NEXT_PUBLIC_API_URL;


/**
 * Server Action that resolves the authenticated user profile server-side.
 * Ideal for use inside Next.js Server Components.
 */
export async function getCurrentServerSession(): Promise<StrictUser | null> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get('__Host-session')?.value;

    if (!sessionToken) {
      return null;
    }

    // Forward the session cookie to the NestJS backend
    const res = await fetch(`${API_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Cookie': `__Host-session=${sessionToken}`,
      },
      cache: 'no-store', // Disable caching for session checks
    });

    if (!res.ok) {
      return null;
    }

    const payload = await res.json();
    const authContext = extractAuthResponseData(payload);

    if (!authContext) {
      return null;
    }

    return {
      id: authContext.userId,
      email: authContext.email,
      role: authContext.role,
      firstName: authContext.firstName,
      lastName: authContext.lastName,
      image: authContext.image,
      emailVerified: authContext.emailVerified,
      twoFactorEnabled: authContext.twoFactorEnabled,
      requiresPasswordChange: false,
    } satisfies StrictUser;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown Error';
    authLogger.error(`[Server Action] Session fetch failed: ${message}`);
    return null;
  }
}
