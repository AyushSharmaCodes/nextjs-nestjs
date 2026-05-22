/**
 * @file storage.exceptions.ts
 *
 * Typed exception hierarchy for the storage module.
 *
 * Rules:
 *  1. ALL exceptions thrown in storage code must extend StorageException.
 *  2. The `errorCode` MUST reference STORAGE_ERROR_CODES — no raw string codes.
 *  3. The `i18nKey` is resolved by the exception filter using nestjs-i18n.
 *  4. The `meta` field carries interpolation variables for i18n templates.
 */

import { HttpException } from '@nestjs/common';
import {
  STORAGE_ERROR_CODES,
  StorageErrorCode,
  getStorageErrorDescriptor,
} from '../constants/storage-error-codes.constant';

export class StorageException extends HttpException {
  constructor(
    public readonly errorCode: StorageErrorCode,
    public readonly i18nKey: string,
    public readonly meta?: Readonly<Record<string, string | number>>,
  ) {
    const descriptor = getStorageErrorDescriptor(errorCode);
    super(
      {
        errorCode: descriptor.code,
        i18nKey,
        meta,
        _internalHint: `StorageException[${errorCode}]`,
      },
      descriptor.httpStatus,
    );
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = new.target.name;
  }

  get code(): string {
    return STORAGE_ERROR_CODES[this.errorCode].code;
  }

  get httpStatus(): number {
    return STORAGE_ERROR_CODES[this.errorCode].httpStatus;
  }
}

export class BucketNotFoundException extends StorageException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('BUCKET_NOT_FOUND', STORAGE_ERROR_CODES.BUCKET_NOT_FOUND.i18nKey, meta);
  }
}

export class FileTypeNotAllowedException extends StorageException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('FILE_TYPE_NOT_ALLOWED', STORAGE_ERROR_CODES.FILE_TYPE_NOT_ALLOWED.i18nKey, meta);
  }
}

export class FileTooLargeException extends StorageException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('FILE_TOO_LARGE', STORAGE_ERROR_CODES.FILE_TOO_LARGE.i18nKey, meta);
  }
}

export class InvalidFilePathException extends StorageException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('INVALID_FILE_PATH', STORAGE_ERROR_CODES.INVALID_FILE_PATH.i18nKey, meta);
  }
}

export class FileNotFoundException extends StorageException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('FILE_NOT_FOUND', STORAGE_ERROR_CODES.FILE_NOT_FOUND.i18nKey, meta);
  }
}

export class UploadFailedException extends StorageException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('UPLOAD_FAILED', STORAGE_ERROR_CODES.UPLOAD_FAILED.i18nKey, meta);
  }
}

export class DeleteFailedException extends StorageException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('DELETE_FAILED', STORAGE_ERROR_CODES.DELETE_FAILED.i18nKey, meta);
  }
}

export class SignedUrlFailedException extends StorageException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('SIGNED_URL_FAILED', STORAGE_ERROR_CODES.SIGNED_URL_FAILED.i18nKey, meta);
  }
}

export class StorageClientNotInitializedException extends StorageException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('CLIENT_NOT_INITIALIZED', STORAGE_ERROR_CODES.CLIENT_NOT_INITIALIZED.i18nKey, meta);
  }
}