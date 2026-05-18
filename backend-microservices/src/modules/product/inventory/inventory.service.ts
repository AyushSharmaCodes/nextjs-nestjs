import { Injectable, NotFoundException } from '@nestjs/common';
import { InventoryRepository } from './inventory.repository';

@Injectable()
export class InventoryService {
  constructor(private readonly inventoryRepo: InventoryRepository) {}

  async getInventory(variantId: string) {
    return this.inventoryRepo.findByVariantId(variantId);
  }

  async reserveStock(variantId: string, quantity: number, sessionId: string) {
    return this.inventoryRepo.reserveStock(variantId, quantity, sessionId);
  }

  async releaseReservation(reservationId: string) {
    return this.inventoryRepo.releaseReservation(reservationId);
  }

  async confirmReservation(reservationId: string) {
    return this.inventoryRepo.confirmReservation(reservationId);
  }

  async adjustQuantity(variantId: string, quantity: number) {
    return this.inventoryRepo.adjustQuantity(variantId, quantity);
  }

  async checkStock(variantId: string) {
    const inventory = await this.inventoryRepo.findByVariantId(variantId);
    if (!inventory) {
      throw new NotFoundException('Inventory not found');
    }
    return {
      available: inventory.availableQuantity,
      reserved: inventory.reservedQuantity,
      total: inventory.availableQuantity + inventory.reservedQuantity,
    };
  }

  async checkStockBulk(variantIds: string[]) {
    const results = await Promise.all(variantIds.map(async (id) => ({
      variantId: id,
      ...await this.inventoryRepo.checkStock(id),
    })));
    return results;
  }
}