import { z } from 'zod';

export const eventRegistrationSchema = z.object({
  firstName: z.string().min(1, { message: 'validation.firstNameRequired' }),
  lastName: z.string().min(1, { message: 'validation.lastNameRequired' }),
  email: z.string().email({ message: 'validation.invalidEmail' }),
  phone: z.string().min(10, { message: 'validation.invalidPhone' }),
  slots: z.coerce.number().min(1, { message: 'validation.minSlots' }).max(5, { message: 'validation.maxSlots' })
});

export type EventRegistrationSchema = z.infer<typeof eventRegistrationSchema>;
