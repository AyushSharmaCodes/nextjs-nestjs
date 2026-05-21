/**
 * @file api-response.type.ts
 * Strictly typed envelope shapes for ALL API responses in this application.
 *
 * Rules:
 *  - Every successful response is wrapped in ApiSuccessResponse<T>.
 *  - Every error response is ApiErrorResponse (never raw messages, never stack traces).
 *  - Dates are ISO 8601 strings, never Date objects.
 *  - requestId must be traceable back to the X-Trace-Id response header.
 */

// ---------------------------------------------------------------------------
// Success envelope
// ---------------------------------------------------------------------------

/**
 * Shape returned by the ResponseTransformInterceptor for every successful route.
 */
export interface ApiSuccessResponse<T> {
  readonly success: true;
  readonly data: T;
  readonly message: string;       // i18n-resolved string, never a hardcoded literal
  readonly statusCode: number;
  readonly timestamp: string;     // ISO 8601
  readonly requestId: string;     // === X-Trace-Id response header
}

// ---------------------------------------------------------------------------
// Error envelope
// ---------------------------------------------------------------------------

/**
 * Shape returned by the GlobalExceptionFilter for every error.
 *
 * NEVER includes stack traces, raw Prisma errors, or internal field names.
 */
export interface ApiErrorResponse {
  readonly success: false;
  readonly errorCode: string;     // e.g. "AUTH_001"
  readonly message: string;       // i18n-resolved string
  readonly statusCode: number;
  readonly timestamp: string;     // ISO 8601
  readonly path: string;
  readonly requestId: string;
  readonly meta?: Readonly<Record<string, string | number>>;
  /** Validation field errors (400 only) */
  readonly details?: ReadonlyArray<{
    readonly message: string;
    readonly field: string | null;
    readonly code: string | null;
  }>;
}

// ---------------------------------------------------------------------------
// Pagination meta
// ---------------------------------------------------------------------------

export interface PaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
}

/**
 * Paginated success response — extends the base envelope with pagination.
 */
export type ApiPaginatedResponse<T> = ApiSuccessResponse<T[]> & {
  readonly pagination: PaginationMeta;
};
