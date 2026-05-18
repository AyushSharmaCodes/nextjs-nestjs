import { Controller, Get, Post, Put, Delete, Body, Param, Headers } from '@nestjs/common';
import { AddressService } from './address.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  async getAddresses(@Headers('x-user-id') userId: string) {
    return ApiResponse.success(await this.addressService.getAddresses(userId));
  }

  @Get('primary')
  async getPrimary(@Headers('x-user-id') userId: string) {
    return ApiResponse.success(await this.addressService.getPrimaryAddress(userId));
  }

  @Get(':id')
  async getAddress(@Param('id') id: string) {
    return ApiResponse.success(await this.addressService.getAddress(id));
  }

  @Post()
  async create(@Headers('x-user-id') userId: string, @Body() data: any) {
    return ApiResponse.success(await this.addressService.createAddress(userId, data), 'Address created');
  }

  @Put(':id')
  async update(@Param('id') id: string, @Headers('x-user-id') userId: string, @Body() data: any) {
    return ApiResponse.success(await this.addressService.updateAddress(id, userId, data), 'Address updated');
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    await this.addressService.deleteAddress(id, userId);
    return ApiResponse.success(null, 'Address deleted');
  }

  @Put(':id/primary')
  async setPrimary(@Param('id') id: string, @Headers('x-user-id') userId: string) {
    return ApiResponse.success(await this.addressService.setPrimaryAddress(id, userId), 'Primary address set');
  }
}