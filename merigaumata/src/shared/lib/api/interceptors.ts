import { InternalAxiosRequestConfig, AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import { tokenVault } from './tokens';
import { ApiError, normalizeError } from '@/shared/lib/errors';
import { apiLogger } from '@/shared/lib/logger';
import * as Sentry from '@sentry/nextjs';

// Queue to hold requests while token is refreshing
interface PendingRequest {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
}

let isRefreshing = false;
let failedQueue: PendingRequest[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Request interceptor to safely inject JWT authorization headers, correlation IDs, and Sentry distributed traces.
 */
export const requestAuthInterceptor = (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
  const requestId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  
  // Save startup telemetry inside metadata
  (config as any)._startTime = performance.now();
  (config as any)._requestId = requestId;

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

    const token = tokenVault.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
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
      const config = response.config;
      const startTime = (config as any)._startTime;
      const requestId = (config as any)._requestId;
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
      const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
      const startTime = config ? (config as any)._startTime : undefined;
      const requestId = config ? (config as any)._requestId : undefined;
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
      
      // If error is 401 and request has not been retried yet
      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        apiLogger.warn('🔑 Token expired. Attempting token refresh queue...', { requestId });

        if (isRefreshing) {
          // Token is already refreshing, queue this request
          return new Promise<string>((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return apiInstance(originalRequest);
            })
            .catch((err) => Promise.reject(normalizeError(err)));
        }

        originalRequest._retry = true;
        isRefreshing = true;

        return new Promise<string>((resolve, reject) => {
          // Simulate backend refresh token exchange
          setTimeout(() => {
            const mockNewToken = 'mock_jwt_token_refreshed';
            tokenVault.setToken(mockNewToken);
            resolve(mockNewToken);
          }, 600);
        })
          .then((token) => {
            isRefreshing = false;
            processQueue(null, token);
            
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            apiLogger.info('🔑 Token refresh succeeded. Retrying failed request...', { requestId });
            return apiInstance(originalRequest);
          })
          .catch((err) => {
            isRefreshing = false;
            processQueue(err, null);
            tokenVault.clearToken();
            tokenVault.clearUserRole();
            tokenVault.clearUserEmail();
            
            apiLogger.error('❌ Token refresh failed. Redirecting user to login...', { requestId });

            // Redirect to login if on the client browser
            if (typeof window !== 'undefined') {
              window.location.href = '/';
            }
            return Promise.reject(normalizeError(err));
          });
      }

      return Promise.reject(apiErr);
    }
  );
};
