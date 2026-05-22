/**
 * @file tokens.ts
 *
 * Auth is handled exclusively via secure HTTP-only cookies managed by Better Auth.
 * No JWT, access token, or auth-sensitive data is ever stored in localStorage,
 * sessionStorage, or JS-accessible memory.
 *
 * This module is kept as a no-op stub so existing import sites compile without
 * changes. All methods are intentional no-ops — the real auth state lives in
 * the `__Host-session` HTTP-only cookie and is validated server-side on every
 * request by BetterAuthGuard.
 *
 * For reading the current user, use:
 *   - Client components: `useStrictAuth()` hook (reads from Better Auth SDK session)
 *   - Server components: `getCurrentServerSession()` server action
 *   - API routes: `BetterAuthGuard` populates `request.user`
 */

export const tokenVault = {
  // ── Auth token — always no-op (cookie-only) ──────────────────────────────
  getToken: (): string | null => null,
  setToken: (_token: string): void => {},
  clearToken: (): void => {},

  // ── Role / email — no-op: derive from useStrictAuth() or session cookie ──
  // These were previously stored in localStorage which is incorrect for a
  // cookie-only auth architecture. Role and email are available from the
  // Better Auth session without any client-side storage.
  getUserRole: (): string | null => null,
  setUserRole: (_role: string): void => {},
  clearUserRole: (): void => {},

  getUserEmail: (): string | null => null,
  setUserEmail: (_email: string): void => {},
  clearUserEmail: (): void => {},
};
