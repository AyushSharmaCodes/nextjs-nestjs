import { Injectable } from '@nestjs/common';
import { DeliveryRepository } from './delivery.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryZone, DeliveryCharge, DeliveryPartner } from './entities/delivery-zone.entity';

@Injectable()
export class DeliveryService {
  constructor(private readonly deliveryRepo: DeliveryRepository) {}

  async calculateDelivery(scope: string, productId?: string, variantId?: string, quantity?: number) {
    return this.deliveryRepo.calculateDelivery(scope, productId, variantId, quantity);
  }

  async getGlobalConfig() { return this.deliveryRepo.findGlobal(); }
  async getProductConfig(productId: string) { return this.deliveryRepo.findByProductId(productId); }
  async getVariantConfig(variantId: string) { return this.deliveryRepo.findByVariantId(variantId); }
  async createConfig(data: any) { return this.deliveryRepo.create(data); }
  async deleteConfig(id: string) { return this.deliveryRepo.delete(id); }
}

@Injectable()
export class DeliveryZoneService {
  constructor(
    @InjectRepository(DeliveryZone) private zoneRepo: Repository<DeliveryZone>,
    @InjectRepository(DeliveryCharge) private chargeRepo: Repository<DeliveryCharge>,
    @InjectRepository(DeliveryPartner) private partnerRepo: Repository<DeliveryPartner>,
  ) {}

  async getZones() { return this.zoneRepo.find({ where: { isActive: true }, order: { priority: 'ASC' } }); }
  async getZoneById(id: string) { return this.zoneRepo.findOne({ where: { id } }); }
  async createZone(data: Partial<DeliveryZone>) { return this.zoneRepo.save(this.zoneRepo.create(data)); }
  async updateZone(id: string, data: Partial<DeliveryZone>) { await this.zoneRepo.update(id, data); return this.zoneRepo.findOne({ where: { id } }); }
  async findZoneForPinCode(pinCode: string) { const zones = await this.getZones(); return zones.find(z => z.pinCodes?.includes(pinCode)); }

  async getCharges(zoneId: string) { return this.chargeRepo.find({ where: { zoneId, isActive: true }, order: { minWeight: 'ASC' } }); }
  async calculateCharge(zoneId: string, weight: number) { const charges = await this.getCharges(zoneId); return charges.find(c => weight >= c.minWeight && (c.maxWeight === null || weight <= c.maxWeight)); }
  async createCharge(data: Partial<DeliveryCharge>) { return this.chargeRepo.save(this.chargeRepo.create(data)); }
  async updateCharge(id: string, data: Partial<DeliveryCharge>) { await this.chargeRepo.update(id, data); return this.chargeRepo.findOne({ where: { id } }); }

  async getPartners() { return this.partnerRepo.find({ where: { isActive: true }, order: { priority: 'ASC' } }); }
  async createPartner(data: Partial<DeliveryPartner>) { return this.partnerRepo.save(this.partnerRepo.create(data)); }
  async updatePartner(id: string, data: Partial<DeliveryPartner>) { await this.partnerRepo.update(id, data); return this.partnerRepo.findOne({ where: { id } }); }
}