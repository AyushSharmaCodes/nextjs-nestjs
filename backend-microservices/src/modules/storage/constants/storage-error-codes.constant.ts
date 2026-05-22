/**
 * @file storage-error-codes.constant.ts
 *
 * Central error-code registry for the storage module.
 *
 * RULES:
 *  1. Every exception thrown in this module MUST reference a code from this object.
 *  2. Never throw raw string messages — always use a code.
 *  3. The i18nKey mirrors the nestjs-i18n translation path: `storage.errors.<key>`.
 */

export const STORAGE_ERROR_CODES = {
  // ─── 400-range client errors ───────────────────────────────────────────

  /** The requested bucket does not exist or is not accessible. */
  BUCKET_NOT_FOUND: {
    code: 'STORAGE_001',
    httpStatus: 404,
    i18nKey: 'storage.errors.BUCKET_NOT_FOUND',
  },

  /** The file extension or MIME type is not allowed for this bucket. */
  FILE_TYPE_NOT_ALLOWED: {
    code: 'STORAGE_002',
    httpStatus: 400,
    i18nKey: 'storage.errors.FILE_TYPE_NOT_ALLOWED',
  },

  /** The file exceeds the maximum allowed size for this bucket. */
  FILE_TOO_LARGE: {
    code: 'STORAGE_003',
    httpStatus: 413,
    i18nKey: 'storage.errors.FILE_TOO_LARGE',
  },

  /** The file path is invalid or attempts directory traversal. */
  INVALID_FILE_PATH: {
    code: 'STORAGE_004',
    httpStatus: 400,
    i18nKey: 'storage.errors.INVALID_FILE_PATH',
  },

  // ─── 404-range not found errors ────────────────────────────────────────

  /** The file does not exist in the bucket. */
  FILE_NOT_FOUND: {
    code: 'STORAGE_010',
    httpStatus: 404,
    i18nKey: 'storage.errors.FILE_NOT_FOUND',
  },

  // ─── 500-range server errors ────────────────────────────────────────────

  /** Failed to upload file to Supabase storage. */
  UPLOAD_FAILED: {
    code: 'STORAGE_050',
    httpStatus: 500,
    i18nKey: 'storage.errors.UPLOAD_FAILED',
  },

  /** Failed to delete file from Supabase storage. */
  DELETE_FAILED: {
    code: 'STORAGE_051',
    httpStatus: 500,
    i18nKey: 'storage.errors.DELETE_FAILED',
  },

  /** Failed to generate signed URL. */
  SIGNED_URL_FAILED: {
    code: 'STORAGE_052',
    httpStatus: 500,
    i18nKey: 'storage.errors.SIGNED_URL_FAILED',
  },

  /** Supabase storage client is not properly initialized. */
  CLIENT_NOT_INITIALIZED: {
    code: 'STORAGE_053',
    httpStatus: 500,
    i18nKey: 'storage.errors.CLIENT_NOT_INITIALIZED',
  },
} as const;

/**
 * Union of all valid storage error code keys.
 */
export type StorageErrorCode = keyof typeof STORAGE_ERROR_CODES;

/**
 * Retrieve the full error descriptor for a code key.
 */
export function getStorageErrorDescriptor<K extends StorageErrorCode>(
  key: K,
): (typeof STORAGE_ERROR_CODES)[K] {
  return STORAGE_ERROR_CODES[key];
}

/**
 * Lookup a code string (e.g. "STORAGE_001") and return the matching key.
 */
export function findStorageErrorKeyByCode(
  code: string,
): StorageErrorCode | null {
  for (const key of Object.keys(STORAGE_ERROR_CODES) as StorageErrorCode[]) {
    if (STORAGE_ERROR_CODES[key].code === code) {
      return key;
    }
  }
  return null;
}