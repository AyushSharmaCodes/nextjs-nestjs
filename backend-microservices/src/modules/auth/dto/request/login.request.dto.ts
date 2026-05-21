/**
 * @file login.request.dto.ts
 * Validates the email/password sign-in request body.
 * Uses Zod v4 via nestjs-zod to match the global ZodValidationPipe.
 */

import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const LoginRequestSchema = z.object({
  email: z
    .string()
    .email('Please provide a valid email address')
    .toLowerCase()
    .trim(),

  password: z
    .string()
    .min(8, 'Password must be at least 8 characters'),
});

export class LoginRequestDto extends createZodDto(LoginRequestSchema) {}

export type LoginRequestPayload = z.infer<typeof LoginRequestSchema>;
