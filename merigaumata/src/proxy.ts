import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { serverEnv } from '@/core/env/server';
import { jwtVerify } from 'jose';

const intlMiddleware = createMiddleware(routing);

const protectedRoutes = ['/admin', '/manager', '/checkout', '/auth/setup2FA', '/profile'];
const API_URL = serverEnv.NEXT_PUBLIC_API_URL;


export default async function middleware(request: NextRequest) {
  let response = intlMiddleware(request);

  const path = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some((route) => path.includes(route));
  
  if (isProtected) {
    const sessionCookieName = '__Host-session';
    const jwtCookieName = 'better-auth.session_data';
    
    const sessionToken = request.cookies.get(sessionCookieName)?.value;
    const jwtToken = request.cookies.get(jwtCookieName)?.value;

    const segments = path.split('/');
    const locale = (routing.locales as readonly string[]).includes(segments[1]) ? segments[1] : 'en';

    // 1. Check for basic cookie presence at the edge
    if (!sessionToken) {
      const loginUrl = new URL(`/${locale}/auth/login`, request.url);
      return NextResponse.redirect(loginUrl);
    }

    try {
      let userRoles: string[] = [];
      let meResStatus = 200;
      let sessionDataValid = false;
      let isTwoFactorVerified = true;

      // 2. Validate JWT locally at the Edge (Fast path)
      if (jwtToken && process.env.BETTER_AUTH_SECRET) {
        const secret = new TextEncoder().encode(process.env.BETTER_AUTH_SECRET);
        try {
          const { payload } = await jwtVerify(jwtToken, secret);
          const role = (payload.user as { role?: string })?.role;
          if (role) userRoles = [role];
          isTwoFactorVerified = (payload.session as { twoFactorVerified?: boolean })?.twoFactorVerified ?? true;
          sessionDataValid = true;
        } catch (jwtError) {
          // If expired or invalid, we fallback to backend validation
          sessionDataValid = false;
        }
      }

      // 3. Fallback to Backend Validation (Slow path)
      if (!sessionDataValid) {
        const meRes = await fetch(`${API_URL}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Cookie': `${sessionCookieName}=${sessionToken}`,
          },
        });

        meResStatus = meRes.status;

        if (meRes.ok) {
          const payload = await meRes.json();
          // better-auth user object might have `role` string or `roles` array
          if (payload.user?.role) {
            userRoles = [payload.user.role];
          } else if (payload.user?.roles) {
            userRoles = payload.user.roles;
          }
          // if better-auth returns 200, 2FA is verified or not required
          isTwoFactorVerified = true; 
        }
      }

      // 4. Handle Unauthenticated / 2FA Pending
      if (meResStatus === 401 || meResStatus === 403 || isTwoFactorVerified === false) {
        const hasSessionCookie = Boolean(request.cookies.get(sessionCookieName)?.value);
        if (hasSessionCookie && (meResStatus === 401 || isTwoFactorVerified === false)) {
          return NextResponse.redirect(new URL(`/${locale}/auth/verify`, request.url));
        }
        const redirectRes = NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
        redirectRes.cookies.delete(sessionCookieName);
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
    } catch (err) {
      // On transient network / 5xx errors, redirect to login without clearing the session cookie
      // so the user can retry. Don't delete the cookie on server errors.
      return NextResponse.redirect(new URL(`/${locale}/auth/login`, request.url));
    }

  }

  return response;
}

export const config = {
  matcher: ['/', '/(hi|en|ta|te)/:path*', '/((?!_next|_vercel|.*\\..*).*)'],
};
