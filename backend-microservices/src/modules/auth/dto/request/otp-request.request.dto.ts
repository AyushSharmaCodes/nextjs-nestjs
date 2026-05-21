/**
 * @file otp-request.request.dto.ts
 * Validates the OTP send request (step 1 — request OTP by email).
 * Zod v4 compatible.
 */

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const OtpRequestSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),

  /**
   * OTP type determines which Better Auth plugin handles generation.
   *  - 'sign-in'        → emailOTP plugin (sign-in flow)
   *  - 'email-verification' → emailOTP plugin (account verification)
   */
  type: z
    .enum(['sign-in', 'email-verification', 'forget-password'])
    .default('sign-in'),
});

export class OtpRequestDto extends createZodDto(OtpRequestSchema) {}

export type OtpRequestPayload = z.infer<typeof OtpRequestSchema>;
