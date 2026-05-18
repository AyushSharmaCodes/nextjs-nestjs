import { z } from 'zod';

export const RazorpayWebhookSchema = z.object({
  entity: z.string(),
  account_id: z.string().optional(),
  event: z.string(),
  contains: z.array(z.string()).optional(),
  payload: z.object({
    payment: z.object({
      entity: z.object({
        id: z.string(),
        amount: z.number(),
        currency: z.string(),
        status: z.string(),
        order_id: z.string().optional(),
        method: z.string().optional(),
        captured: z.boolean().optional(),
        description: z.string().optional(),
        card_id: z.string().optional(),
        bank: z.string().optional(),
        wallet: z.string().optional(),
        vpa: z.string().optional(),
        email: z.string().email().optional(),
        contact: z.string().optional(),
        notes: z.record(z.string(), z.string()).optional(),
        created_at: z.number(),
      }),
    }).optional(),
    order: z.object({
      entity: z.object({
        id: z.string(),
        amount: z.number(),
        currency: z.string(),
        status: z.string(),
        method: z.string().optional(),
      }),
    }).optional(),
  }),
});

export type RazorpayWebhookPayload = z.infer<typeof RazorpayWebhookSchema>;