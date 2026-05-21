/**
 * @file register.request.dto.ts
 * Validates the registration request body.
 * Zod v4 compatible — uses `.min()` message strings directly.
 */

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

export const RegisterRequestSchema = z
  .object({
    firstName: z
      .string()
      .min(1, 'First name cannot be empty')
      .max(100, 'First name is too long')
      .trim(),

    lastName: z
      .string()
      .min(1, 'Last name cannot be empty')
      .max(100, 'Last name is too long')
      .trim(),

    email: z
      .string()
      .email('Please provide a valid email address')
      .toLowerCase()
      .trim(),

    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(
        PASSWORD_REGEX,
        'Password must include uppercase, lowercase, a number, and a special character',
      ),

    confirmPassword: z.string(),

    /**
     * Accept Terms & Conditions must be true before submission.
     * Zod v4: z.literal(true) works without errorMap wrapper.
     */
    acceptedTerms: z.literal(true, {
      error: 'You must accept the Terms & Conditions',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export class RegisterRequestDto extends createZodDto(RegisterRequestSchema) {}

export type RegisterRequestPayload = z.infer<typeof RegisterRequestSchema>;
