/**
 * @file otp-verify.request.dto.ts
 * Validates the OTP verification request (step 2 — submit the 6-digit code).
 * Zod v4 compatible.
 */

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const OtpVerifyRequestSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),

  /**
   * The 6-digit numeric OTP code.
   * Validated as a string to preserve leading zeros.
   */
  otp: z
    .string()
    .length(6, 'OTP must be exactly 6 digits')
    .regex(/^\d{6}$/, 'OTP must contain only digits'),
});

export class OtpVerifyRequestDto extends createZodDto(OtpVerifyRequestSchema) {}

export type OtpVerifyRequestPayload = z.infer<typeof OtpVerifyRequestSchema>;
