/**
 * @file refresh-token.request.dto.ts
 *
 * In Better Auth's architecture the refresh/session extension is performed
 * automatically via the session cookie — there is no explicit refresh body.
 * This DTO exists for documentation and for any custom session-management
 * endpoints that may be added.
 *
 * Trade-off: We do NOT accept a refresh token in the request body.
 * The session cookie IS the refresh credential. This DTO validates
 * optional explicit session management parameters only.
 */

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const RefreshTokenRequestSchema = z.object({
  /**
   * If provided, revoke all other sessions after refreshing this one.
   * Useful for "log me out everywhere else" feature.
   */
  revokeOtherSessions: z.boolean().optional().default(false),
});

export class RefreshTokenRequestDto extends createZodDto(RefreshTokenRequestSchema) {}

export type RefreshTokenRequestPayload = z.infer<typeof RefreshTokenRequestSchema>;
