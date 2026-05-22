/**
 * @file auth.api.ts
 *
 * @deprecated This file is no longer used.
 *
 * The auth flow is handled entirely by the Better Auth SDK via `authClient`
 * (src/lib/auth-client.ts) and the typed wrapper `authApiClient`
 * (src/features/auth/api/auth.client.ts).
 *
 * The endpoints `/auth/login` and `/auth/signup` referenced here do NOT exist
 * on the backend. Better Auth handles sign-in at `/api/auth/sign-in/email`
 * and sign-up at `/api/auth/sign-up/email` — both are managed internally by
 * the SDK and should never be called directly.
 *
 * Use:
 *   import { authApiClient } from './auth.client';
 *   import { authClient } from '@/lib/auth-client';
 */

export {};
