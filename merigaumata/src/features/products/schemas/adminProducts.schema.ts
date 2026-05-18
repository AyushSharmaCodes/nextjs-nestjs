import { z } from 'zod';

export const adminProductSchema = z.object({
  name: z.string().min(2, { message: 'validation.nameMin' }),
  slug: z
    .string()
    .min(2, { message: 'validation.slugMin' })
    .regex(/^[a-z0-9-]+$/, { message: 'validation.slugFormat' }),
  price: z.coerce.number().positive({ message: 'validation.pricePositive' }),
  mrp: z.coerce.number().positive({ message: 'validation.mrpPositive' }).optional().nullable(),
  description: z.string().min(10, { message: 'validation.descriptionMin' }),
  imageUrl: z.string().url({ message: 'validation.imageUrlFormat' }),
  category: z.string().min(1, { message: 'validation.categoryRequired' }),
  stock: z.coerce.number().int().nonnegative({ message: 'validation.stockNonNegative' }),
  featured: z.boolean().default(false),
  isSale: z.boolean().default(false),
  status: z.enum(['active', 'draft', 'archived']).default('active'),
  soldCount: z.coerce.number().int().nonnegative().default(0),
}).refine(
  (data) => {
    if (data.mrp && data.price > data.mrp) {
      return false;
    }
    return true;
  },
  {
    message: 'validation.priceMrpMismatch',
    path: ['price'],
  }
);

export type AdminProductInput = z.infer<typeof adminProductSchema>;
