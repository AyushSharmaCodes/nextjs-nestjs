import { Injectable, NotFoundException } from '@nestjs/common';
import { ProductRepository } from './product.repository';
import { CreateProductDto, UpdateProductDto, ProductQueryDto, CreateVariantDto, UpdateVariantDto } from './dto/product.dto';

@Injectable()
export class ProductService {
  constructor(private readonly productRepo: ProductRepository) {}

  async getProducts(query: ProductQueryDto) {
    return this.productRepo.findAll(query);
  }

  async getProductById(id: string) {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async getProductBySlug(slug: string) {
    const product = await this.productRepo.findBySlug(slug);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return product;
  }

  async createProduct(data: CreateProductDto) {
    return this.productRepo.create(data);
  }

  async updateProduct(id: string, data: UpdateProductDto) {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.productRepo.update(id, data);
  }

  async deleteProduct(id: string) {
    const product = await this.productRepo.findById(id);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.productRepo.delete(id);
  }

  async getVariantById(variantId: string) {
    const variant = await this.productRepo.findVariantById(variantId);
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }
    return variant;
  }

  async createVariant(productId: string, data: CreateVariantDto) {
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new NotFoundException('Product not found');
    }
    return this.productRepo.createVariant(productId, data);
  }

  async updateVariant(variantId: string, data: UpdateVariantDto) {
    const variant = await this.productRepo.findVariantById(variantId);
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }
    return this.productRepo.updateVariant(variantId, data);
  }

  async deleteVariant(variantId: string) {
    const variant = await this.productRepo.findVariantById(variantId);
    if (!variant) {
      throw new NotFoundException('Variant not found');
    }
    return this.productRepo.deleteVariant(variantId);
  }
}