import { AxiosRequestConfig } from 'axios';

/**
 * Creates a standard browser/Node AbortController for cancellable HTTP requests.
 */
export function createAbortController(): AbortController {
  return new AbortController();
}

/**
 * Normalizes request query parameter parameters into standard search inputs.
 */
export function serializeParams(params: Record<string, any>): Record<string, string> {
  const result: Record<string, string> = {};
  
  Object.entries(params).forEach(([key, val]) => {
    if (val !== undefined && val !== null) {
      if (Array.isArray(val)) {
        result[key] = val.join(',');
      } else if (typeof val === 'object') {
        result[key] = JSON.stringify(val);
      } else {
        result[key] = String(val);
      }
    }
  });

  return result;
}

/**
 * Transforms a standard nested JavaScript object into a flat multipart/form-data payload.
 */
export function toFormData(data: Record<string, any>): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value === undefined || value === null) {
      return;
    }

    if (value instanceof File || value instanceof Blob) {
      formData.append(key, value);
    } else if (Array.isArray(value)) {
      value.forEach((item, index) => {
        if (item instanceof File || item instanceof Blob) {
          formData.append(`${key}[${index}]`, item);
        } else if (typeof item === 'object') {
          formData.append(`${key}[${index}]`, JSON.stringify(item));
        } else {
          formData.append(`${key}[${index}]`, String(item));
        }
      });
    } else if (typeof value === 'object') {
      formData.append(key, JSON.stringify(value));
    } else {
      formData.append(key, String(value));
    }
  });

  return formData;
}

/**
 * Generates an Axios request config builder with standard support for API versioning headers.
 */
export function buildRequestConfig(
  config?: AxiosRequestConfig,
  apiVersion?: string
): AxiosRequestConfig {
  const customHeaders: Record<string, string> = {};

  if (apiVersion) {
    customHeaders['Accept-Version'] = apiVersion;
  }

  return {
    ...config,
    headers: {
      ...customHeaders,
      ...config?.headers,
    },
  };
}
