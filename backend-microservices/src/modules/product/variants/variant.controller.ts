import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { VariantService } from './variant.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('variants')
export class VariantController {
  constructor(private readonly service: VariantService) {}

  @Get('product/:productId')
  async getByProduct(@Param('productId') productId: string) {
    return ApiResponse.success(await this.service.getByProduct(productId));
  }

  @Get('low-stock')
  async getLowStock(@Query('threshold') threshold = 10) {
    return ApiResponse.success(await this.service.getLowStock(Number(threshold)));
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    return ApiResponse.success(await this.service.getById(id));
  }

  @Post()
  async create(@Body() body: any) { // ts-audit-ignore
    return ApiResponse.success(await this.service.create(body), 'Variant created');
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any) { // ts-audit-ignore
    return ApiResponse.success(await this.service.update(id, body), 'Variant updated');
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return ApiResponse.success(null, 'Variant deleted');
  }

  @Put(':id/stock')
  async updateStock(@Param('id') id: string, @Body() body: { quantity: number }) {
    return ApiResponse.success(await this.service.updateStock(id, body.quantity), 'Stock updated');
  }

  @Get('options/:productId')
  async getOptions(@Param('productId') productId: string) {
    return ApiResponse.success(await this.service.getOptions(productId));
  }

  @Post('options')
  async createOption(@Body() body: any) { // ts-audit-ignore
    return ApiResponse.success(await this.service.createOption(body), 'Option created');
  }

  @Get('sku/:sku')
  async findBySku(@Param('sku') sku: string) {
    return ApiResponse.success(await this.service.findBySku(sku));
  }
}