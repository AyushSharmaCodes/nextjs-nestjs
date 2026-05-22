import { InternalAxiosRequestConfig, AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { ApiError, normalizeError } from '@/shared/lib/errors';
import { apiLogger } from '@/shared/lib/logger';
import * as Sentry from '@sentry/nextjs';

interface ExtendedAxiosConfig extends InternalAxiosRequestConfig {
  _startTime?: number;
  _requestId?: string;
}

/**
 * Auth architecture: session is managed exclusively via the `__Host-session`
 * HTTP-only cookie set by Better Auth. No tokens are stored in JS-accessible
 * storage. `withCredentials: true` on the Axios instance ensures the cookie
 * is forwarded automatically on every request.
 */

/**
 * Request interceptor — injects correlation IDs and Sentry distributed trace
 * headers. No auth token injection needed (cookie is automatic).
 */
export const requestAuthInterceptor = (config: ExtendedAxiosConfig): ExtendedAxiosConfig => {
  const requestId =
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15);

  config._startTime = performance.now();
  config._requestId = requestId;

  if (config.headers) {
    config.headers['X-Request-ID'] = requestId;

    // Propagate Sentry distributed trace headers to link backend spans
    try {
      const traceData = Sentry.getTraceData ? Sentry.getTraceData() : {};
      Object.entries(traceData).forEach(([key, value]) => {
        if (value) config.headers[key] = value;
      });
    } catch {
      // Sentry not available — non-fatal
    }
  }

  apiLogger.debug(
    '🚀 API request starting: {method} {url} | RequestID: {requestId}',
    { method: config.method?.toUpperCase(), url: config.url, requestId },
  );

  return config;
};

/**
 * Response interceptor — logs latency and handles session expiry.
 *
 * On 401: the HTTP-only cookie is expired or invalid. Better Auth will have
 * already cleared it server-side. We redirect to login so the user can
 * re-authenticate and receive a fresh cookie.
 *
 * No localStorage writes — cross-tab logout is handled by the browser
 * naturally: once the cookie is gone, any tab that makes a request gets 401
 * and redirects independently.
 */
export const setupResponseInterceptor = (apiInstance: AxiosInstance): void => {
  apiInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      const config = response.config as ExtendedAxiosConfig;
      const duration = config._startTime
        ? Math.round(performance.now() - config._startTime)
        : 0;

      apiLogger.info(
        '✅ API request success: {method} {url} | Status: {status} | Latency: {duration}ms | RequestID: {requestId}',
        {
          method: config.method?.toUpperCase(),
          url: config.url,
          status: response.status,
          duration,
          requestId: config._requestId,
        },
      );

      if (duration > 2000) {
        apiLogger.warn(
          '🐢 Slow API response: {method} {url} took {duration}ms',
          { method: config.method?.toUpperCase(), url: config.url, duration },
        );
      }

      return response;
    },

    async (error: AxiosError) => {
      const config = error.config as ExtendedAxiosConfig | undefined;
      const duration = config?._startTime
        ? Math.round(performance.now() - config._startTime)
        : 0;
      const apiErr = normalizeError(error);

      apiLogger.error(
        '❌ API request failed: {method} {url} | Status: {status} | Code: {code} | Latency: {duration}ms | RequestID: {requestId}',
        {
          method: config?.method?.toUpperCase(),
          url: config?.url,
          status: error.response?.status ?? 0,
          message: apiErr.message,
          code: apiErr.code,
          duration,
          requestId: config?._requestId,
        },
      );

      // 401 — session cookie is expired or revoked.
      // Redirect to login unless already on an auth page (prevents redirect loops).
      // No localStorage writes — cookie-only auth needs no client-side cleanup.
      if (error.response?.status === 401 && typeof window !== 'undefined') {
        const isAlreadyOnAuthPage = window.location.pathname.includes('/auth/');
        if (!isAlreadyOnAuthPage) {
          apiLogger.warn('Session expired — redirecting to login', {
            requestId: config?._requestId,
          });
          window.location.href = resolveLoginRedirect();
        }
      }

      return Promise.reject(apiErr);
    },
  );
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function resolveLoginRedirect(): string {
  const pathname = window.location.pathname;
  const search = window.location.search;
  const segments = pathname.split('/');
  const maybeLocale = segments[1];
  const supportedLocales = ['en', 'hi', 'ta', 'te'];
  const locale = supportedLocales.includes(maybeLocale ?? '') ? maybeLocale : 'en';
  const returnTo = encodeURIComponent(`${pathname}${search}`);
  return `/${locale}/auth/login?next=${returnTo}`;
}
