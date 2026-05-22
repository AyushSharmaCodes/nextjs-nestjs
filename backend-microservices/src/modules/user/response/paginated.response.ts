import { ApiEnvelope } from './api-envelope.response';

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> extends ApiEnvelope<T[]> {
  meta: PaginationMeta;
}
