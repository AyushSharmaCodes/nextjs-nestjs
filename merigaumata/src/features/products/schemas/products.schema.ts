import { z } from 'zod';

export const reviewSchema = z.object({
  name: z.string().min(2, { message: 'validation.nameMin' }),
  rating: z.number().min(1, { message: 'validation.ratingMin' }).max(5),
  text: z.string().min(10, { message: 'validation.textMin' }),
});

export const productQuerySchema = z.object({
  category: z.string().optional(),
  benefit: z.string().optional(),
  sortBy: z.enum(['featured', 'price-low-high', 'price-high-low', 'rating', 'newest']).default('featured'),
  search: z.string().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().default(9),
});

export type ReviewInput = z.infer<typeof reviewSchema>;
export type ProductQueryInput = z.infer<typeof productQuerySchema>;
