import { Controller, Get, Param, Query } from '@nestjs/common';
import { GeoService } from './geo.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('geo')
export class GeoController {
  constructor(private readonly service: GeoService) {}

  @Get('countries')
  async getCountries(@Query('search') search?: string) {
    return ApiResponse.success(await this.service.getCountries(search));
  }

  @Get('countries/:code')
  async getCountry(@Param('code') code: string) {
    return ApiResponse.success(await this.service.getCountryByCode(code));
  }

  @Get('states')
  async getStates(
    @Query('countryId') countryId?: string,
    @Query('search') search?: string,
  ) {
    return ApiResponse.success(await this.service.getStates(countryId, search));
  }

  @Get('states/:code')
  async getState(@Param('code') code: string, @Query('countryId') countryId: string) {
    return ApiResponse.success(await this.service.getStateByCode(code, countryId));
  }

  @Get('cities')
  async getCities(
    @Query('stateId') stateId?: string,
    @Query('countryId') countryId?: string,
    @Query('search') search?: string,
  ) {
    return ApiResponse.success(await this.service.getCities(stateId, countryId, search));
  }

  @Get('search')
  async search(@Query('q') query: string) {
    return ApiResponse.success(await this.service.searchLocation(query));
  }

  @Get('pincode/:code')
  async getPinCode(@Param('code') code: string) {
    return ApiResponse.success(await this.service.getPinCode(code));
  }

  @Get('pincode/search')
  async searchPinCodes(@Query('q') query: string) {
    return ApiResponse.success(await this.service.searchPinCodes(query));
  }
}