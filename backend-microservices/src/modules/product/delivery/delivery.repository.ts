import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryConfig } from './entities/delivery-config.entity';

@Injectable()
export class DeliveryRepository {
  constructor(
    @InjectRepository(DeliveryConfig)
    private readonly configRepo: Repository<DeliveryConfig>,
  ) {}

  async findGlobal() {
    return this.configRepo.findOne({ where: { scope: 'GLOBAL', isActive: true } });
  }

  async findByProductId(productId: string) {
    return this.configRepo.findOne({ where: { productId, scope: 'PRODUCT', isActive: true } });
  }

  async findByVariantId(variantId: string) {
    return this.configRepo.findOne({ where: { variantId, scope: 'VARIANT', isActive: true } });
  }

  async calculateDelivery(scope: string, productId?: string, variantId?: string, quantity?: number) {
    let config: DeliveryConfig | null = null;

    if (scope === 'VARIANT' && variantId) {
      config = await this.findByVariantId(variantId);
    } else if (scope === 'PRODUCT' && productId) {
      config = await this.findByProductId(productId);
    }

    if (!config) {
      config = await this.findGlobal();
    }

    if (!config) {
      return { deliveryCharge: 0, gst: 0, total: 0 };
    }

    let charge = Number(config.baseDeliveryCharge);
    const quantityValue = quantity || 1;

    if (config.calculationType === 'PER_PACKAGE') {
      const packages = Math.ceil(quantityValue / config.maxItemsPerPackage);
      charge = charge * packages;
    }

    const gst = config.isTaxable ? charge * (Number(config.gstPercentage) / 100) : 0;

    return {
      deliveryCharge: charge,
      gst,
      total: charge + gst,
      calculationType: config.calculationType,
    };
  }

  async create(data: Partial<DeliveryConfig>) {
    const config = this.configRepo.create(data);
    return this.configRepo.save(config);
  }

  async delete(id: string) {
    await this.configRepo.update(id, { isActive: false });
  }
}