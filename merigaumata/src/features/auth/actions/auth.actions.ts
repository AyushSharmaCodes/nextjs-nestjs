'use server';

import { cookies } from 'next/headers';
import { LoginFormValues, SignupFormValues } from '../schemas/auth.schema';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function loginAction(data: LoginFormValues) {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

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

export async function verifyOtpAction(email: string, otp: string, type: 'LOGIN' | 'EMAIL_VERIFICATION') {
  try {
    const endpoint = type === 'LOGIN' ? '/auth/verify-otp/login' : '/auth/verify-otp/registration';
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });

    const setCookieHeader = response.headers.get('set-cookie');
    if (setCookieHeader) {
      const parts = setCookieHeader.split(';');
      const [name, value] = parts[0].split('=');
      if (name && value) {
        (await cookies()).set(name, value, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
      }
    }

    const result = await response.json();

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

export async function signupAction(data: SignupFormValues) {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    const result = await response.json();

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
