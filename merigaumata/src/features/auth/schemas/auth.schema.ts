import { z } from 'zod';

const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/;

export const loginSchema = z.object({
  email: z.string().email('validation.invalidEmail'),
  // Backend requires min 8 chars — keep consistent
  password: z.string().min(8, 'validation.passwordMinLength'),
});

export const signupSchema = z.object({
  firstName: z.string().min(1, 'validation.firstNameRequired'),
  lastName: z.string().min(1, 'validation.lastNameRequired'),
  email: z.string().email('validation.invalidEmail'),
  // Backend requires min 8 + complexity (upper, lower, digit, special)
  password: z
    .string()
    .min(8, 'validation.passwordMinLength')
    .regex(PASSWORD_COMPLEXITY_REGEX, 'validation.passwordComplexity'),
  confirmPassword: z.string().min(8, 'validation.passwordMinLength'),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'validation.passwordMismatch',
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('validation.invalidEmail'),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(8, 'validation.passwordMinLength'),
  confirmPassword: z.string().min(8, 'validation.passwordMinLength'),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'validation.passwordMismatch',
});

export const otpSchema = z.object({
  email: z.string().email('validation.invalidEmail'),
});

export const magicLinkSchema = z.object({
  email: z.string().email('validation.invalidEmail'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
export type OtpFormValues = z.infer<typeof otpSchema>;
export type MagicLinkFormValues = z.infer<typeof magicLinkSchema>;
