import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { serverEnv } from '@/core/env/server';

const API_URL = serverEnv.NEXT_PUBLIC_API_URL;

interface JwtPayload {
  roles?: string[];
  sub?: string;
  email?: string;
  [key: string]: unknown;
}

function decodeJwt(token: string): JwtPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = atob(base64);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const cookieStore = await cookies();
  const locale = 'en'; // Standard fallback locale

  if (!code || !state) {
    return NextResponse.redirect(new URL(`/${locale}/auth/login?error=OAUTH_INVALID_REQUEST`, request.url));
  }

  // Retrieve incoming verification cookies
  const stateCookie = request.cookies.get('google_oauth_state')?.value || '';
  const verifierCookie = request.cookies.get('google_oauth_code_verifier')?.value || '';

  try {
    const response = await fetch(`${API_URL}/auth/google/exchange`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `google_oauth_state=${stateCookie}; google_oauth_code_verifier=${verifierCookie}`,
      },
      body: JSON.stringify({ code, state }),
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL(`/${locale}/auth/login?error=OAUTH_EXCHANGE_FAILED`, request.url));
    }

    const result = await response.json();
    const setCookies = response.headers.getSetCookie();

    // Set cookies in Next.js cookie store
    for (const cookieHeader of setCookies) {
      const parts = cookieHeader.split(';');
      const [pair] = parts;
      const eqIdx = pair.indexOf('=');
      if (eqIdx === -1) continue;
      const name = pair.substring(0, eqIdx).trim();
      const value = pair.substring(eqIdx + 1).trim();

      type SameSiteOption = 'lax' | 'strict' | 'none';

      const options: {
        path: string;
        httpOnly: boolean;
        secure: boolean;
        sameSite: SameSiteOption;
        maxAge?: number;
      } = {
        path: '/',
        httpOnly: true,
        secure: serverEnv.NODE_ENV === 'production',
        sameSite: 'lax',
      };

      for (let i = 1; i < parts.length; i++) {
        const option = parts[i].trim();
        const [optName, optValue] = option.split('=');
        const key = optName.toLowerCase();
        if (key === 'httponly') options.httpOnly = true;
        else if (key === 'secure') options.secure = true;
        else if (key === 'samesite') options.sameSite = optValue ? (optValue.toLowerCase() as SameSiteOption) : 'lax';
        else if (key === 'max-age') options.maxAge = parseInt(optValue, 10);
      }

      cookieStore.set(name, value, options);
    }

    // Decode user role to redirect appropriately
    const accessToken = cookieStore.get('access_token')?.value;
    let targetPath = `/${locale}`;

    if (accessToken) {
      const payload = decodeJwt(accessToken);
      const roles: string[] = payload?.roles || [];

      if (roles.includes('ADMIN')) {
        targetPath = `/${locale}/admin`;
      } else if (roles.includes('MANAGER')) {
        targetPath = `/${locale}/manager`;
      }
    }

    // Clean up Google OAuth PKCE verification cookies
    cookieStore.delete('google_oauth_state');
    cookieStore.delete('google_oauth_code_verifier');

    return NextResponse.redirect(new URL(targetPath, request.url));
  } catch (error) {
    return NextResponse.redirect(new URL(`/${locale}/auth/login?error=OAUTH_CONNECTION_ERROR`, request.url));
  }
}
