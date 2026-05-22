import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const CreateProductSchema = z.object({
  title: z.string().min(1),
  titleI18n: z.record(z.string(), z.string()).optional(),
  description: z.string().optional(),
  descriptionI18n: z.record(z.string(), z.string()).optional(),
  sellingPrice: z.number().min(0),
  mrp: z.number().min(0).optional(),
  images: z.array(z.string()).optional(),
  categoryId: z.string().uuid().optional(),
  variantMode: z.string().optional(),
  tags: z.array(z.string()).optional(),
  benefits: z.array(z.string()).optional(),
  isNew: z.boolean().optional(),
  isReturnable: z.boolean().optional(),
  returnDays: z.number().int().min(0).optional(),
  defaultHsnCode: z.string().optional(),
  defaultGstRate: z.number().min(0).optional(),
  defaultTaxApplicable: z.boolean().optional(),
  defaultPriceIncludesTax: z.boolean().optional(),
});

export class CreateProductDto extends createZodDto(CreateProductSchema) {}

export const UpdateProductSchema = CreateProductSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export class UpdateProductDto extends createZodDto(UpdateProductSchema) {}

export const ProductQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  categoryId: z.string().uuid().optional(),
  search: z.string().optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  sortBy: z.string().default('createdAt'),
  sortOrder: z.enum(['ASC', 'DESC']).default('DESC'),
});

export class ProductQueryDto extends createZodDto(ProductQuerySchema) {}

export const CreateVariantSchema = z.object({
  sku: z.string().min(1),
  sizeLabel: z.string().optional(),
  sizeValue: z.string().optional(),
  unit: z.string().optional(),
  mrp: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  variantImageUrl: z.string().optional(),
  isDefault: z.boolean().optional(),
});

export class CreateVariantDto extends createZodDto(CreateVariantSchema) {}

export const UpdateVariantSchema = z.object({
  sku: z.string().optional(),
  mrp: z.number().min(0).optional(),
  sellingPrice: z.number().min(0).optional(),
  stockQuantity: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

export class UpdateVariantDto extends createZodDto(UpdateVariantSchema) {}