/**
 * @file token.response.dto.ts
 *
 * Metadata about the current session token.
 *
 * IMPORTANT: The actual access/refresh tokens are NEVER returned in the
 * response body. They live exclusively in HttpOnly cookies managed by
 * Better Auth. This DTO only carries expiry metadata for the UI to
 * show "session expires in..." information.
 */

import type { SessionId } from '../../types/auth.types';

export class TokenResponseDto {
  /** Branded session ID for trace correlation. */
  readonly sessionId: SessionId;

  /** ISO 8601 expiry timestamp — let the UI decide how to display it. */
  readonly expiresAt: string;

  /** Whether the session has 2FA verification stamp. */
  readonly twoFactorVerified: boolean;

  constructor(params: {
    sessionId: SessionId;
    expiresAt: string;
    twoFactorVerified: boolean;
  }) {
    this.sessionId = params.sessionId;
    this.expiresAt = params.expiresAt;
    this.twoFactorVerified = params.twoFactorVerified;
  }
}
