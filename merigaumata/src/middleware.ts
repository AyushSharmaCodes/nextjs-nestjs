import { NextRequest, NextResponse } from 'next/server';
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createMiddleware(routing);

const protectedRoutes = ['/admin', '/manager', '/checkout'];
const publicRoutes = ['/login', '/signup', '/auth'];

export default async function middleware(request: NextRequest) {
  // First, run next-intl middleware to determine locale and handle redirects
  const response = intlMiddleware(request);

  // Check if current path is protected
  const path = request.nextUrl.pathname;
  const isProtected = protectedRoutes.some(route => path.includes(route));
  
  if (isProtected) {
    const accessToken = request.cookies.get('access_token')?.value;
    const refreshToken = request.cookies.get('refresh_token')?.value;

    if (!accessToken && !refreshToken) {
      // Redirect to login if accessing protected route without tokens
      const loginUrl = new URL('/en/auth/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
    
    // Note: If accessToken is missing but refreshToken exists, 
    // the frontend might attempt to refresh it via server action or layout fetch.
    // For middleware, we simply check existence. A robust implementation
    // would decode the JWT here (without verifying signature) just to check expiry
    // or rely on the backend API failing and handling redirects in client components.
  }

  return response;
}

export const config = {
  // Match only internationalized pathnames
  matcher: ['/', '/(hi|en|ta|te)/:path*', '/((?!_next|_vercel|.*\\..*).*)']
};

