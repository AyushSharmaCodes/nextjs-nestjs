import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProductVariant, VariantOption } from './entities/variant.entity';

@Injectable()
export class VariantService {
  constructor(
    @InjectRepository(ProductVariant) private variantRepo: Repository<ProductVariant>,
    @InjectRepository(VariantOption) private optionRepo: Repository<VariantOption>,
  ) {}

  async getByProduct(productId: string) {
    return this.variantRepo.find({ where: { productId, isActive: true }, order: { price: 'ASC' } });
  }

  async getById(id: string) {
    return this.variantRepo.findOne({ where: { id } });
  }

  async create(data: Partial<ProductVariant>) {
    return this.variantRepo.save(this.variantRepo.create(data));
  }

  async update(id: string, data: Partial<ProductVariant>) {
    await this.variantRepo.update(id, data);
    return this.variantRepo.findOne({ where: { id } });
  }

  async delete(id: string) {
    return this.variantRepo.update(id, { isActive: false });
  }

  async updateStock(id: string, quantity: number) {
    const variant = await this.variantRepo.findOne({ where: { id } });
    if (!variant) return null;
    const newStock = variant.stock + quantity;
    await this.variantRepo.update(id, { stock: newStock });
    return this.variantRepo.findOne({ where: { id } });
  }

  async getLowStock(threshold = 10) {
    return this.variantRepo
      .createQueryBuilder('v')
      .where('v.stock <= v.lowStockThreshold')
      .andWhere('v.isActive = true')
      .andWhere('v.stock > 0')
      .getMany();
  }

  async getOptions(productId: string) {
    return this.optionRepo.find({ where: { productId, isActive: true } });
  }

  async createOption(data: Partial<VariantOption>) {
    return this.optionRepo.save(this.optionRepo.create(data));
  }

  async findBySku(sku: string) {
    return this.variantRepo.findOne({ where: { sku } });
  }
}