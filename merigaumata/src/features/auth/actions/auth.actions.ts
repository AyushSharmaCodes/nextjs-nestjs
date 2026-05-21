'use server';

import { cookies } from 'next/headers';
import { LoginFormValues, SignupFormValues } from '../schemas/auth.schema';
import {
  AuthActionResult,
  AuthApiEnvelope,
  LoginInitData,
  OtpType,
  ResendOtpData,
  SignupInitData,
  VerifyOtpData,
} from '../types/auth.types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.INTERNAL_API_URL ||
  `http://127.0.0.1:${process.env.API_PORT || '5001'}`;

function buildNetworkErrorMessage(error: Error): string {
  if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
    return `Unable to connect to auth server at ${API_URL}. Please verify backend host/port and CORS settings.`;
  }
  return 'Failed to connect to the authentication server.';
}

async function parseErrorResult(response: Response): Promise<{ error: string; message: string; details: AuthApiEnvelope<null>['details'] | null }> {
  const fallback = {
    error: 'BAD_REQUEST',
    message: `Request failed with status ${response.status}`,
    details: null,
  };

  try {
    const body = (await response.json()) as AuthApiEnvelope<null>;
    return {
      error: body.error || fallback.error,
      message: body.message || fallback.message,
      details: body.details || null,
    };
  } catch {
    return fallback;
  }
}

async function persistAuthCookies(response: Response) {
  const cookieStore = await cookies();
  const headerCookies = response.headers.getSetCookie();

  for (const cookieHeader of headerCookies) {
    const [pair] = cookieHeader.split(';');
    const [name, ...valueParts] = pair.split('=');
    const value = valueParts.join('=');
    if (!name || !value) continue;

    cookieStore.set(name.trim(), value.trim(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      path: '/',
    });
  }
}

export async function loginAction(data: LoginFormValues): Promise<AuthActionResult<LoginInitData>> {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const parsedError = await parseErrorResult(response);
      return { 
        success: false, 
        error: parsedError.error,
        message: parsedError.message,
        details: parsedError.details,
      };
    }

    const result = (await response.json()) as AuthApiEnvelope<LoginInitData>;

    return { success: true, data: result.data };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Connection failure');
    return { success: false, error: 'CONNECTION_ERROR', message: buildNetworkErrorMessage(err), details: null };
  }
}

export async function verifyOtpAction(email: string, otp: string, type: OtpType): Promise<AuthActionResult<VerifyOtpData>> {
  try {
    const endpoint = type === 'LOGIN' ? '/auth/verify-otp/login' : '/auth/verify-otp/registration';
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    await persistAuthCookies(response);

    if (!response.ok) {
      const parsedError = await parseErrorResult(response);
      return { 
        success: false, 
        error: parsedError.error,
        message: parsedError.message,
        details: parsedError.details,
      };
    }

    const result = (await response.json()) as AuthApiEnvelope<VerifyOtpData>;

    return { success: true, data: result.data };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Connection failure');
    return { success: false, error: 'CONNECTION_ERROR', message: buildNetworkErrorMessage(err), details: null };
  }
}

export async function resendOtpAction(email: string): Promise<AuthActionResult<ResendOtpData>> {
  try {
    const response = await fetch(`${API_URL}/auth/resend-otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    const result = (await response.json()) as AuthApiEnvelope<ResendOtpData>;

    if (!response.ok) {
      return {
        success: false,
        error: result.error || 'BAD_REQUEST',
        message: result.message || 'Failed to resend OTP',
        details: result.details || null,
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Connection failure');
    return { success: false, error: 'CONNECTION_ERROR', message: buildNetworkErrorMessage(err), details: null };
  }
}

export async function signupAction(data: SignupFormValues): Promise<AuthActionResult<SignupInitData>> {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const parsedError = await parseErrorResult(response);
      return { 
        success: false, 
        error: parsedError.error,
        message: parsedError.message,
        details: parsedError.details,
      };
    }

    const result = (await response.json()) as AuthApiEnvelope<SignupInitData>;

    return { success: true, data: result.data };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Connection failure');
    return { success: false, error: 'CONNECTION_ERROR', message: buildNetworkErrorMessage(err), details: null };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get('refresh_token')?.value;

  if (refreshToken) {
    await fetch(`${API_URL}/auth/logout`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Cookie': `refresh_token=${refreshToken}`
      },
    });
  }

  cookieStore.delete('access_token');
  cookieStore.delete('refresh_token');
  
  return { success: true };
}

export async function getSessionAction() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get('access_token')?.value;

  if (!accessToken) return { user: null };

  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      headers: {
        'Cookie': `access_token=${accessToken}`
      }
    });

    if (!response.ok) return { user: null };
    const result = await response.json();
    return { user: result.data.user };
  } catch (e) {
    return { user: null };
  }
}
