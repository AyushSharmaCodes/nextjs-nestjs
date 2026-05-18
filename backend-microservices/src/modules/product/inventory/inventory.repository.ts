import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Inventory, InventoryReservation } from './entities/inventory.entity';

@Injectable()
export class InventoryRepository {
  constructor(
    @InjectRepository(Inventory)
    private readonly inventoryRepo: Repository<Inventory>,
    @InjectRepository(InventoryReservation)
    private readonly reservationRepo: Repository<InventoryReservation>,
    private readonly dataSource: DataSource,
  ) {}

  async findByVariantId(variantId: string) {
    return this.inventoryRepo.findOne({ where: { variantId } });
  }

  async createOrUpdate(variantId: string, availableQuantity: number) {
    const existing = await this.findByVariantId(variantId);
    if (existing) {
      await this.inventoryRepo.update(existing.id, { availableQuantity, version: existing.version + 1 });
      return this.findByVariantId(variantId);
    }
    const inventory = this.inventoryRepo.create({ variantId, availableQuantity });
    return this.inventoryRepo.save(inventory);
  }

  async reserveStock(variantId: string, quantity: number, sessionId: string): Promise<InventoryReservation> {
    const inventory = await this.findByVariantId(variantId);
    if (!inventory || inventory.availableQuantity < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const reservation = this.reservationRepo.create({
      variantId,
      quantity,
      sessionId,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000),
    });
    await this.reservationRepo.save(reservation);

    await this.inventoryRepo.update(inventory.id, {
      availableQuantity: inventory.availableQuantity - quantity,
      reservedQuantity: inventory.reservedQuantity + quantity,
    });

    return reservation;
  }

  async releaseReservation(reservationId: string) {
    const reservation = await this.reservationRepo.findOne({ where: { id: reservationId } });
    if (!reservation) return;

    const inventory = await this.findByVariantId(reservation.variantId);
    if (inventory) {
      await this.inventoryRepo.update(inventory.id, {
        availableQuantity: inventory.availableQuantity + reservation.quantity,
        reservedQuantity: inventory.reservedQuantity - reservation.quantity,
      });
    }
    await this.reservationRepo.delete(reservationId);
  }

  async confirmReservation(reservationId: string) {
    const reservation = await this.reservationRepo.findOne({ where: { id: reservationId } });
    if (!reservation) throw new NotFoundException('Reservation not found');

    await this.reservationRepo.delete(reservationId);
  }

  async adjustQuantity(variantId: string, quantity: number) {
    const inventory = await this.findByVariantId(variantId);
    if (!inventory) {
      return this.createOrUpdate(variantId, quantity);
    }
    await this.inventoryRepo.update(inventory.id, { availableQuantity: quantity });
    return this.findByVariantId(variantId);
  }

  async checkStock(variantId: string) {
    const inventory = await this.findByVariantId(variantId);
    if (!inventory) {
      return { available: 0, reserved: 0, total: 0 };
    }
    return {
      available: inventory.availableQuantity,
      reserved: inventory.reservedQuantity,
      total: inventory.availableQuantity + inventory.reservedQuantity,
    };
  }
}