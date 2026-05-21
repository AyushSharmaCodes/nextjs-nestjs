import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { AddressService } from './address.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('addresses')
export class AddressController {
  constructor(private readonly addressService: AddressService) {}

  @Get()
  async getAddresses(@CurrentUser() user: { id: string }) {
    return ApiResponse.success(await this.addressService.getAddresses(user.id));
  }

  @Get('primary')
  async getPrimary(@CurrentUser() user: { id: string }) {
    return ApiResponse.success(await this.addressService.getPrimaryAddress(user.id));
  }

  @Get(':id')
  async getAddress(@Param('id') id: string) {
    return ApiResponse.success(await this.addressService.getAddress(id));
  }

  @Post()
  async create(@CurrentUser() user: { id: string }, @Body() data: any) {
    return ApiResponse.success(await this.addressService.createAddress(user.id, data), 'Address created');
  }

  @Put(':id')
  async update(@Param('id') id: string, @CurrentUser() user: { id: string }, @Body() data: any) {
    return ApiResponse.success(await this.addressService.updateAddress(id, user.id, data), 'Address updated');
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    await this.addressService.deleteAddress(id, user.id);
    return ApiResponse.success(null, 'Address deleted');
  }

  @Put(':id/primary')
  async setPrimary(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return ApiResponse.success(await this.addressService.setPrimaryAddress(id, user.id), 'Primary address set');
  }
}
