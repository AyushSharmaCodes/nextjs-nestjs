export interface ApiError {
  code: string;
  details?: Record<string, string[]>;
}

export interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  message: string;
  error?: ApiError;
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  message: string;
  error?: ApiError;
  meta: PageMeta;
}
