/**
 * @file magic-link-verify.request.dto.ts
 * Validates the magic-link verification request (step 2 — clicking the link).
 * Zod v4 compatible.
 */

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const MagicLinkVerifyRequestSchema = z.object({
  /**
   * The opaque token embedded in the magic-link URL as ?token=...
   * Better Auth generates this internally — we only validate it's non-empty.
   */
  token: z
    .string()
    .min(10, 'Invalid magic link token'),
});

export class MagicLinkVerifyRequestDto extends createZodDto(MagicLinkVerifyRequestSchema) {}

export type MagicLinkVerifyRequestPayload = z.infer<typeof MagicLinkVerifyRequestSchema>;
