import { InternalAxiosRequestConfig, AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { tokenVault } from './tokens';
import { ApiError, normalizeError } from '@/shared/lib/errors';
import { apiLogger } from '@/shared/lib/logger';
import * as Sentry from '@sentry/nextjs';

interface ExtendedAxiosConfig extends InternalAxiosRequestConfig {
  _startTime?: number;
  _requestId?: string;
}

// Session management is handled exclusively via secure HTTP-Only cookies.
// Active session tokens are automatically validated by Better Auth on the backend.

/**
 * Request interceptor to safely inject JWT authorization headers, correlation IDs, and Sentry distributed traces.
 */
export const requestAuthInterceptor = (config: ExtendedAxiosConfig): ExtendedAxiosConfig => {
  const requestId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

  // Save startup telemetry inside metadata
  config._startTime = performance.now();
  config._requestId = requestId;

  if (config.headers) {
    config.headers['X-Request-ID'] = requestId;

    // Inject active Sentry distributed trace headers to link backend spans
    try {
      const traceData = Sentry.getTraceData ? Sentry.getTraceData() : {};
      Object.entries(traceData).forEach(([key, value]) => {
        if (value) {
          config.headers[key] = value;
        }
      });
    } catch {
      // Sentry trace context fallback
    }

    // Cookies are automatically attached via withCredentials.
    // No need to inject Bearer token headers in requestAuthInterceptor.
  }

  apiLogger.debug('🚀 API request starting: {method} {url} | RequestID: {requestId}', {
    method: config.method?.toUpperCase(),
    url: config.url,
    requestId,
  });

  return config;
};


/**
 * Setup response error interceptor to handle 401 token refresh queue.
 */
export const setupResponseInterceptor = (apiInstance: AxiosInstance) => {
  apiInstance.interceptors.response.use(
    (response: AxiosResponse) => {
      const config = response.config as ExtendedAxiosConfig;
      const startTime = config._startTime;
      const requestId = config._requestId;
      const duration = startTime ? Math.round(performance.now() - startTime) : 0;

      apiLogger.info('✅ API request success: {method} {url} | Status: {status} | Latency: {duration}ms | RequestID: {requestId}', {
        method: config.method?.toUpperCase(),
        url: config.url,
        status: response.status,
        duration,
        requestId,
      });

      if (duration > 2000) {
        apiLogger.warn('🐢 Slow API response: {method} {url} took {duration}ms', {
          method: config.method?.toUpperCase(),
          url: config.url,
          duration,
          requestId,
        });
      }

      return response;
    },
    async (error: AxiosError) => {
      const config = error.config as ExtendedAxiosConfig & { _retry?: boolean };
      const startTime = config ? config._startTime : undefined;
      const requestId = config ? config._requestId : undefined;
      const duration = startTime ? Math.round(performance.now() - startTime) : 0;
      const apiErr = normalizeError(error);

      apiLogger.error('❌ API request failed: {method} {url} | Status: {status} | Code: {code} | Latency: {duration}ms | RequestID: {requestId}', {
        method: config?.method?.toUpperCase(),
        url: config?.url,
        status: error.response?.status || 0,
        message: apiErr.message,
        code: apiErr.code,
        duration,
        requestId,
      });

      const originalRequest = config;

      // If session is expired or unauthorized, clear vault metadata and redirect to login
      if (error.response?.status === 401) {
        apiLogger.error('❌ Session expired or unauthorized. Redirecting to login...', { requestId });
        tokenVault.clearToken();
        tokenVault.clearUserRole();
        tokenVault.clearUserEmail();

        if (typeof window !== 'undefined') {
          localStorage.setItem('mgm_session_logout', Date.now().toString());
          const redirectUrl = resolveAuthLoginRedirect();
          window.location.href = redirectUrl;
        }
      }

      return Promise.reject(apiErr);
    }
  );
};

function resolveAuthLoginRedirect(): string {
  if (typeof window === 'undefined') {
    return '/en/auth/login';
  }

  const pathname = window.location.pathname;
  const search = window.location.search;
  const segments = pathname.split('/');
  const maybeLocale = segments[1];
  const locale =
    maybeLocale === 'en' || maybeLocale === 'hi' || maybeLocale === 'ta' || maybeLocale === 'te'
      ? maybeLocale
      : 'en';

  const returnTo = encodeURIComponent(`${pathname}${search}`);
  return `/${locale}/auth/login?next=${returnTo}`;
}
