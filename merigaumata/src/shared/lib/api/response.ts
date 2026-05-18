/**
 * Standard enterprise response envelope for single/collection data payloads.
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

/**
 * Standard envelope for paginated collections with query metadata details.
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Unwraps and extracts the underlying payload data from an ApiResponse envelope safely.
 */
export function resolveResponseData<T>(response: ApiResponse<T>): T {
  return response.data;
}

/**
 * Normalizes dynamic localized backend values securely based on system locale state.
 * Supports localized objects (e.g. { en: "Milk", hi: "दूध" }) or static translation keys.
 */
export function resolveLocalizedValue<T = string>(
  field: Record<string, T> | string | undefined,
  currentLocale: string,
  fallbackLocale = 'en'
): T | string | undefined {
  if (!field) return undefined;
  
  if (typeof field === 'string') {
    return field;
  }

  if (typeof field === 'object') {
    return field[currentLocale] ?? field[fallbackLocale] ?? Object.values(field)[0];
  }

  return undefined;
}
