/**
 * @file auth.exceptions.ts
 *
 * Typed exception hierarchy for the auth module.
 *
 * Rules:
 *  1. ALL exceptions thrown in auth code must extend AuthException.
 *  2. The `errorCode` MUST reference AUTH_ERROR_CODES — no raw string codes.
 *  3. The `i18nKey` is resolved by the exception filter using nestjs-i18n.
 *  4. The `meta` field carries interpolation variables for i18n templates.
 *
 * Trade-off: creating one class per error code adds boilerplate, but gives
 * engineers `catch (e instanceof OtpExpiredException)` semantics and lets
 * TypeScript narrow the `errorCode` type at the call site.
 */

import { HttpException } from '@nestjs/common';
import {
  AUTH_ERROR_CODES,
  AuthErrorCode,
  getAuthErrorDescriptor,
} from '../constants/error-codes.constant';

// ---------------------------------------------------------------------------
// Base class
// ---------------------------------------------------------------------------

/**
 * Base class for all auth module exceptions.
 * The global exception filter detects this type and formats the response
 * using the typed error code registry and i18n service.
 */
export class AuthException extends HttpException {
  constructor(
    public readonly errorCode: AuthErrorCode,
    public readonly i18nKey: string,
    public readonly meta?: Readonly<Record<string, string | number>>,
  ) {
    const descriptor = getAuthErrorDescriptor(errorCode);
    super(
      // Payload — picked up by the exception filter
      {
        errorCode: descriptor.code,
        i18nKey,
        meta,
        // Include a human-readable fallback for dev logs (never sent to client)
        _internalHint: `AuthException[${errorCode}]`,
      },
      descriptor.httpStatus,
    );
    // Maintain proper prototype chain for `instanceof` checks
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = new.target.name;
  }

  /** The short code string, e.g. "AUTH_001" */
  get code(): string {
    return AUTH_ERROR_CODES[this.errorCode].code;
  }

  /** HTTP status derived from the registry — never set ad-hoc. */
  get httpStatus(): number {
    return AUTH_ERROR_CODES[this.errorCode].httpStatus;
  }
}

// ---------------------------------------------------------------------------
// Concrete exception classes — one per error code
// ---------------------------------------------------------------------------

/** Thrown when email/password combination does not match. */
export class InvalidCredentialsException extends AuthException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('INVALID_CREDENTIALS', AUTH_ERROR_CODES.INVALID_CREDENTIALS.i18nKey, meta);
  }
}

/** Thrown when a registration attempt uses an already-registered email. */
export class EmailAlreadyExistsException extends AuthException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('EMAIL_ALREADY_EXISTS', AUTH_ERROR_CODES.EMAIL_ALREADY_EXISTS.i18nKey, meta);
  }
}

/** Thrown when an authenticated action requires a verified email. */
export class EmailNotVerifiedException extends AuthException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('EMAIL_NOT_VERIFIED', AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED.i18nKey, meta);
  }
}

/** Thrown when a submitted OTP has passed its 10-minute expiry. */
export class OtpExpiredException extends AuthException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('OTP_EXPIRED', AUTH_ERROR_CODES.OTP_EXPIRED.i18nKey, meta);
  }
}

/** Thrown when a submitted OTP does not match the stored value. */
export class OtpInvalidException extends AuthException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('OTP_INVALID', AUTH_ERROR_CODES.OTP_INVALID.i18nKey, meta);
  }
}

/** Thrown when a magic-link token is past its expiry. */
export class MagicLinkExpiredException extends AuthException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('MAGIC_LINK_EXPIRED', AUTH_ERROR_CODES.MAGIC_LINK_EXPIRED.i18nKey, meta);
  }
}

/** Thrown when a magic-link token is malformed or not found. */
export class MagicLinkInvalidException extends AuthException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('MAGIC_LINK_INVALID', AUTH_ERROR_CODES.MAGIC_LINK_INVALID.i18nKey, meta);
  }
}

/** Thrown when a magic-link token has already been consumed. */
export class MagicLinkAlreadyUsedException extends AuthException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('MAGIC_LINK_ALREADY_USED', AUTH_ERROR_CODES.MAGIC_LINK_ALREADY_USED.i18nKey, meta);
  }
}

/** Thrown when the session/access token has expired. */
export class TokenExpiredException extends AuthException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('TOKEN_EXPIRED', AUTH_ERROR_CODES.TOKEN_EXPIRED.i18nKey, meta);
  }
}

/** Thrown when the session/access token is malformed or signature fails. */
export class TokenInvalidException extends AuthException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('TOKEN_INVALID', AUTH_ERROR_CODES.TOKEN_INVALID.i18nKey, meta);
  }
}

/** Thrown when refresh-token reuse is detected — revokes entire session. */
export class RefreshTokenReuseException extends AuthException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('REFRESH_TOKEN_REUSE', AUTH_ERROR_CODES.REFRESH_TOKEN_REUSE.i18nKey, meta);
  }
}

/** Thrown when Google OAuth returns an error or profile normalization fails. */
export class GoogleAuthFailedException extends AuthException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('GOOGLE_AUTH_FAILED', AUTH_ERROR_CODES.GOOGLE_AUTH_FAILED.i18nKey, meta);
  }
}

/** Thrown when too many failed auth attempts have locked the account. */
export class AccountLockedException extends AuthException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('ACCOUNT_LOCKED', AUTH_ERROR_CODES.ACCOUNT_LOCKED.i18nKey, meta);
  }
}

/** Thrown when an account has been administratively disabled. */
export class AccountDisabledException extends AuthException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('ACCOUNT_DISABLED', AUTH_ERROR_CODES.ACCOUNT_DISABLED.i18nKey, meta);
  }
}

/** Thrown when session/JWT generation fails at the infrastructure level. */
export class TokenGenerationFailedException extends AuthException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('TOKEN_GENERATION_FAILED', AUTH_ERROR_CODES.TOKEN_GENERATION_FAILED.i18nKey, meta);
  }
}

/** Thrown when a required database write fails. */
export class DbWriteFailedException extends AuthException {
  constructor(meta?: Readonly<Record<string, string | number>>) {
    super('DB_WRITE_FAILED', AUTH_ERROR_CODES.DB_WRITE_FAILED.i18nKey, meta);
  }
}
