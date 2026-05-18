import { z } from 'zod';
import { createZodDto } from 'nestjs-zod';

// Strong password policy: min length 8, at least one uppercase, one lowercase, one number, one symbol
const passwordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')
  .regex(/[\W_]/, 'Password must contain at least one special character');

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address').transform(e => e.toLowerCase()),
  password: passwordSchema,
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});
export class RegisterDto extends createZodDto(RegisterSchema) {}

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address').transform(e => e.toLowerCase()),
  password: z.string().min(1, 'Password is required'),
});
export class LoginDto extends createZodDto(LoginSchema) {}

export const VerifyOtpSchema = z.object({
  email: z.string().email('Invalid email address').transform(e => e.toLowerCase()),
  otp: z.string().length(6, 'OTP must be 6 digits'),
});
export class VerifyOtpDto extends createZodDto(VerifyOtpSchema) {}

export const ResendOtpSchema = z.object({
  email: z.string().email('Invalid email address').transform(e => e.toLowerCase()),
});
export class ResendOtpDto extends createZodDto(ResendOtpSchema) {}
