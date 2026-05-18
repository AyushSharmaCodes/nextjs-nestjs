import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('inventory')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Get(':variantId')
  async getInventory(@Param('variantId') variantId: string) {
    const inventory = await this.inventoryService.getInventory(variantId);
    return ApiResponse.success(inventory);
  }

  @Post('reserve')
  async reserveStock(@Body() body: { variantId: string; quantity: number; sessionId: string }) {
    const reservation = await this.inventoryService.reserveStock(body.variantId, body.quantity, body.sessionId);
    return ApiResponse.success(reservation, 'Stock reserved');
  }

  @Post('release')
  async releaseReservation(@Body() body: { reservationId: string }) {
    await this.inventoryService.releaseReservation(body.reservationId);
    return ApiResponse.success(null, 'Reservation released');
  }

  @Post('confirm')
  async confirmReservation(@Body() body: { reservationId: string }) {
    await this.inventoryService.confirmReservation(body.reservationId);
    return ApiResponse.success(null, 'Reservation confirmed');
  }

  @Get('check/:variantId')
  async checkStock(@Param('variantId') variantId: string) {
    const result = await this.inventoryService.checkStock(variantId);
    return ApiResponse.success(result);
  }

  @Post('check/bulk')
  async checkStockBulk(@Body() body: { variantIds: string[] }) {
    const result = await this.inventoryService.checkStockBulk(body.variantIds);
    return ApiResponse.success(result);
  }
}