import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { serverEnv } from '@/core/env/server';
import { jwtVerify } from 'jose';
import { extractAuthResponseData } from '@/features/auth/lib/auth-response';

const intlMiddleware = createMiddleware(routing);

const protectedRoutes = ['/admin', '/manager', '/checkout', '/auth/setup2FA', '/profile'];
const API_URL = serverEnv.NEXT_PUBLIC_API_URL;
const SESSION_COOKIE_NAME =
  serverEnv.NODE_ENV === 'production' ? '__Host-session' : 'session';
const LEGACY_SESSION_COOKIE_NAMES = ['__Host-session', 'session'] as const;
const SESSION_CACHE_COOKIE_NAME = 'better-auth.session_data';

function buildAuthRedirect(
  request: NextRequest,
  locale: string,
  authPath: '/auth/login' | '/auth/verify',
): NextResponse {
  const redirectUrl = new URL(`/${locale}${authPath}`, request.url);
  const nextPath = `${request.nextUrl.pathname}${request.nextUrl.search}`;

  if (nextPath && !nextPath.includes('/auth/')) {
    redirectUrl.searchParams.set('next', nextPath);
  }

  return NextResponse.redirect(redirectUrl);
}


export default async function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const path = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some((route) => path.includes(route));
  
  if (isProtected) {
    const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const jwtToken = request.cookies.get(SESSION_CACHE_COOKIE_NAME)?.value;

    const segments = path.split('/');
    const locale = (routing.locales as readonly string[]).includes(segments[1]) ? segments[1] : 'en';

    // 1. Check for basic cookie presence at the edge
    if (!sessionToken) {
      return buildAuthRedirect(request, locale, '/auth/login');
    }

    try {
      let userRoles: string[] = [];
      let meResStatus = 200;
      let sessionDataValid = false;

      // 2. Validate JWT locally at the Edge (Fast path)
      if (jwtToken && serverEnv.BETTER_AUTH_SECRET) {
        const secret = new TextEncoder().encode(serverEnv.BETTER_AUTH_SECRET);
        try {
          const { payload } = await jwtVerify(jwtToken, secret);
          const role = (payload.user as { role?: string })?.role;
          if (role) {
            userRoles = [role];
          }
          const requiresRole = path.includes('/admin') || path.includes('/manager');
          sessionDataValid = !requiresRole || userRoles.length > 0;
        } catch (jwtError: unknown) {
          // If expired or invalid, we fallback to backend validation
          sessionDataValid = false;
        }
      }

      // 3. Fallback to Backend Validation (Slow path)
      if (!sessionDataValid) {
        const meRes = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Cookie': `${SESSION_COOKIE_NAME}=${sessionToken}`,
          },
        });

        meResStatus = meRes.status;

        if (meRes.ok) {
          const payload = await meRes.json();
          const authContext = extractAuthResponseData(payload);
          if (authContext?.role) {
            userRoles = [authContext.role];
          }
        }
      }

      if (meResStatus >= 400) {
        const redirectRes = buildAuthRedirect(request, locale, '/auth/login');
        if (meResStatus === 401 || meResStatus === 403) {
          for (const cookieName of LEGACY_SESSION_COOKIE_NAMES) {
            redirectRes.cookies.delete(cookieName);
          }
          redirectRes.cookies.delete(SESSION_CACHE_COOKIE_NAME);
        }
        return redirectRes;
      }

      // 5. RBAC Admin Enforcements
      if (path.includes('/admin')) {
        const isAdmin = userRoles.includes('ADMIN');
        if (!isAdmin) {
          const homeUrl = new URL(`/${locale}`, request.url);
          return NextResponse.redirect(homeUrl);
        }
      }

      // 6. RBAC Manager Enforcements
      if (path.includes('/manager')) {
        const isAuthorized = userRoles.includes('MANAGER') || userRoles.includes('ADMIN');
        if (!isAuthorized) {
          const homeUrl = new URL(`/${locale}`, request.url);
          return NextResponse.redirect(homeUrl);
        }
      }
    } catch {
      // On transient network / 5xx errors, redirect to login without clearing the session cookie
      // so the user can retry. Don't delete the cookie on server errors.
      return buildAuthRedirect(request, locale, '/auth/login');
    }

  }

  return response;
}

export const config = {
  matcher: ['/', '/(hi|en|ta|te)/:path*', '/((?!_next|_vercel|.*\\..*).*)'],
};
