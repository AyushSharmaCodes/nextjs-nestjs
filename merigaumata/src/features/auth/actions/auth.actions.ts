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

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

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

    const result = (await response.json()) as AuthApiEnvelope<LoginInitData>;

    if (!response.ok) {
      return { 
        success: false, 
        error: result.error || 'BAD_REQUEST', 
        message: result.message || 'Login failed',
        details: result.details || null
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: 'CONNECTION_ERROR', message: 'Failed to connect to the authentication server.' };
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

    const result = (await response.json()) as AuthApiEnvelope<VerifyOtpData>;

    if (!response.ok) {
      return { 
        success: false, 
        error: result.error || 'BAD_REQUEST', 
        message: result.message || 'OTP Verification failed',
        details: result.details || null
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: 'CONNECTION_ERROR', message: 'Failed to connect to the authentication server.' };
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
  } catch {
    return { success: false, error: 'CONNECTION_ERROR', message: 'Failed to connect to the authentication server.', details: null };
  }
}

export async function signupAction(data: SignupFormValues): Promise<AuthActionResult<SignupInitData>> {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = (await response.json()) as AuthApiEnvelope<SignupInitData>;

    if (!response.ok) {
      return { 
        success: false, 
        error: result.error || 'BAD_REQUEST', 
        message: result.message || 'Signup failed',
        details: result.details || null
      };
    }

    return { success: true, data: result.data };
  } catch (error) {
    return { success: false, error: 'CONNECTION_ERROR', message: 'Failed to connect to the authentication server.' };
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
