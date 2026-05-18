import { Controller, Get, Post, Delete, Body, Param, Query } from '@nestjs/common';
import { DeliveryService } from './delivery.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('delivery')
export class DeliveryController {
  constructor(private readonly deliveryService: DeliveryService) {}

  @Get('calculate')
  async calculateDelivery(
    @Query('scope') scope: string,
    @Query('productId') productId?: string,
    @Query('variantId') variantId?: string,
    @Query('quantity') quantity?: string,
  ) {
    const result = await this.deliveryService.calculateDelivery(
      scope, productId, variantId, quantity ? Number(quantity) : undefined,
    );
    return ApiResponse.success(result);
  }

  @Get('configs')
  async getGlobalConfig() {
    const config = await this.deliveryService.getGlobalConfig();
    return ApiResponse.success(config);
  }

  @Get('configs/product/:productId')
  async getProductConfig(@Param('productId') productId: string) {
    const config = await this.deliveryService.getProductConfig(productId);
    return ApiResponse.success(config);
  }

  @Get('configs/variant/:variantId')
  async getVariantConfig(@Param('variantId') variantId: string) {
    const config = await this.deliveryService.getVariantConfig(variantId);
    return ApiResponse.success(config);
  }

  @Post('configs')
  async createConfig(@Body() data: any) {
    const config = await this.deliveryService.createConfig(data);
    return ApiResponse.success(config, 'Delivery config created');
  }

  @Delete('configs/:id')
  async deleteConfig(@Param('id') id: string) {
    await this.deliveryService.deleteConfig(id);
    return ApiResponse.success(null, 'Delivery config deleted');
  }
}