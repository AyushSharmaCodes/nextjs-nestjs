/**
 * @file magic-link.request.dto.ts
 * Validates the magic-link send request (step 1).
 * Zod v4 compatible.
 */

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const MagicLinkRequestSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),

  /**
   * Optional callbackURL — if omitted, Better Auth falls back to its
   * configured baseURL.
   */
  callbackURL: z
    .string()
    .url('callbackURL must be a valid URL')
    .optional(),
});

export class MagicLinkRequestDto extends createZodDto(MagicLinkRequestSchema) {}

export type MagicLinkRequestPayload = z.infer<typeof MagicLinkRequestSchema>;
