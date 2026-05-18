import { z } from 'zod';

export const CartItemSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().optional(),
  quantity: z.number().int().min(1).max(99),
  price: z.number().positive().optional(),
});

export const AddCartItemDto = CartItemSchema;
export type AddCartItemDto = z.infer<typeof CartItemSchema>;

export const UpdateCartItemDto = z.object({
  quantity: z.number().int().min(1).max(99),
});
export type UpdateCartItemDto = z.infer<typeof UpdateCartItemDto>;

export const ApplyCouponDto = z.object({
  couponId: z.string().uuid(),
  code: z.string().min(1).max(50),
  discountAmount: z.number().nonnegative(),
});
export type ApplyCouponDto = z.infer<typeof ApplyCouponDto>;