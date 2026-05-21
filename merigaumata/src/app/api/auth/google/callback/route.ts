import { NextRequest, NextResponse } from 'next/server';
import { serverEnv } from '@/core/env/server';

const API_URL = serverEnv.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  const locale = 'en'; // Standard fallback locale

  if (!code || !state) {
    return NextResponse.redirect(new URL(`/${locale}/auth/login?error=OAUTH_INVALID_REQUEST`, request.url));
  }

  // Retrieve incoming verification cookies
  const stateCookie = request.cookies.get('google_oauth_state')?.value || '';
  const verifierCookie = request.cookies.get('google_oauth_code_verifier')?.value || '';

  try {
    const response = await fetch(`${API_URL}/api/auth/callback/google?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, {
      method: 'GET',
      redirect: 'manual',
      headers: {
        'Cookie': `google_oauth_state=${stateCookie}; google_oauth_code_verifier=${verifierCookie}`,
      },
    });

    if (!response.ok) {
      return NextResponse.redirect(new URL(`/${locale}/auth/login?error=OAUTH_EXCHANGE_FAILED`, request.url));
    }

    const redirectTarget = new URL(`/${locale}/auth/verify`, request.url);
    const nextResponse = NextResponse.redirect(redirectTarget);

    const setCookies = response.headers.getSetCookie();
    for (const cookieHeader of setCookies) {
      nextResponse.headers.append('set-cookie', cookieHeader);
    }

    // Delete PKCE cookies on the frontend origin after callback handoff
    nextResponse.cookies.delete('google_oauth_state');
    nextResponse.cookies.delete('google_oauth_code_verifier');

    return nextResponse;
  } catch {
    return NextResponse.redirect(new URL(`/${locale}/auth/login?error=OAUTH_CONNECTION_ERROR`, request.url));
  }
}
