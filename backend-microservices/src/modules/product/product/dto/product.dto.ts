import { IsString, IsNumber, IsOptional, IsArray, IsBoolean, IsObject, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @IsString()
  title: string;

  @IsObject()
  @IsOptional()
  titleI18n?: Record<string, string>;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  descriptionI18n?: Record<string, string>;

  @IsNumber()
  sellingPrice: number;

  @IsNumber()
  @IsOptional()
  mrp?: number;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  variantMode?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsArray()
  @IsOptional()
  benefits?: string[];

  @IsBoolean()
  @IsOptional()
  isNew?: boolean;

  @IsBoolean()
  @IsOptional()
  isReturnable?: boolean;

  @IsNumber()
  @IsOptional()
  returnDays?: number;

  @IsString()
  @IsOptional()
  defaultHsnCode?: string;

  @IsNumber()
  @IsOptional()
  defaultGstRate?: number;

  @IsBoolean()
  @IsOptional()
  defaultTaxApplicable?: boolean;

  @IsBoolean()
  @IsOptional()
  defaultPriceIncludesTax?: boolean;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsObject()
  @IsOptional()
  titleI18n?: Record<string, string>;

  @IsString()
  @IsOptional()
  description?: string;

  @IsObject()
  @IsOptional()
  descriptionI18n?: Record<string, string>;

  @IsNumber()
  @IsOptional()
  sellingPrice?: number;

  @IsNumber()
  @IsOptional()
  mrp?: number;

  @IsArray()
  @IsOptional()
  images?: string[];

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsOptional()
  tags?: string[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isNew?: boolean;
}

export class ProductQueryDto {
  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  page?: number = 1;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  limit?: number = 20;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  search?: string;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  minPrice?: number;

  @IsNumber()
  @IsOptional()
  @Type(() => Number)
  maxPrice?: number;

  @IsString()
  @IsOptional()
  sortBy?: string = 'createdAt';

  @IsString()
  @IsOptional()
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

export class CreateVariantDto {
  @IsString()
  sku: string;

  @IsString()
  @IsOptional()
  sizeLabel?: string;

  @IsString()
  @IsOptional()
  sizeValue?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @IsNumber()
  @IsOptional()
  mrp?: number;

  @IsNumber()
  @IsOptional()
  sellingPrice?: number;

  @IsNumber()
  @IsOptional()
  stockQuantity?: number;

  @IsString()
  @IsOptional()
  variantImageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}

export class UpdateVariantDto {
  @IsString()
  @IsOptional()
  sku?: string;

  @IsNumber()
  @IsOptional()
  mrp?: number;

  @IsNumber()
  @IsOptional()
  sellingPrice?: number;

  @IsNumber()
  @IsOptional()
  stockQuantity?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}