import axios from 'axios';
import { env } from '@/core/env/client';
import { requestAuthInterceptor, setupResponseInterceptor } from './interceptors';

/**
 * Enterprise standard Axios client singleton configured with global limits.
 */
export const apiInstance = axios.create({
  baseURL: env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Register request interceptor to inject auth tokens safely
apiInstance.interceptors.request.use(
  requestAuthInterceptor,
  (error) => Promise.reject(error)
);

// Register response interceptor for normalized errors and automatic JWT refresh queuing
setupResponseInterceptor(apiInstance);
