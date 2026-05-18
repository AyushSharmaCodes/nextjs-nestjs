import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('validation.invalidEmail'),
  password: z.string().min(6, 'validation.passwordMinLength'),
});

export const signupSchema = z.object({
  firstName: z.string().min(1, 'validation.firstNameRequired'),
  lastName: z.string().min(1, 'validation.lastNameRequired'),
  email: z.string().email('validation.invalidEmail'),
  password: z.string().min(6, 'validation.passwordMinLength'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
export type SignupFormValues = z.infer<typeof signupSchema>;
