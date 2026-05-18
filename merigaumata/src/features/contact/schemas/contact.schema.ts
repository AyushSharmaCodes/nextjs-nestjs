import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'form.validation.nameMin' }),
  email: z.string().email({ message: 'form.validation.emailInvalid' }),
  phone: z.string().min(10, { message: 'form.validation.phoneMin' }),
  subject: z.string().min(3, { message: 'form.validation.subjectMin' }),
  message: z.string().min(1, { message: 'form.validation.messageRequired' }).superRefine((val, ctx) => {
    const wordCount = val.trim() ? val.trim().split(/\s+/).length : 0;
    
    if (wordCount < 50) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: JSON.stringify({
          key: 'form.errorMinWords',
          values: { count: wordCount }
        })
      });
    } else if (wordCount > 100) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: JSON.stringify({
          key: 'form.errorMaxWords',
          values: { count: wordCount }
        })
      });
    }
  })
});

export type ContactFormInputs = z.infer<typeof contactFormSchema>;
