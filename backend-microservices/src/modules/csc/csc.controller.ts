// src/modules/csc/csc.controller.ts
import { Controller, Get, Post, Headers, HttpCode, HttpStatus, UnauthorizedException } from '@nestjs/common';
import { CscService } from './csc.service';
import { Public } from '../auth/decorators/public.decorator';
import { AppConfigService } from '../../infrastructure/config/app-config.service';

@Controller('countries')
export class CscController {
  constructor(
    private readonly cscService: CscService,
    private readonly config: AppConfigService,
  ) {}

  @Public()
  @Get()
  async getCountries() {
    // Automatically triggers sync in background if data is stale or missing
    await this.cscService.syncCountriesIfStale();

    const countries = await this.cscService.getCountriesFromDb();
    return {
      success: true,
      count: countries.length,
      data: countries,
    };
  }

  @Public()
  @Post('sync')
  @HttpCode(HttpStatus.OK)
  async syncCountries(@Headers('authorization') authHeader?: string) {
    const expectedToken = `Bearer ${this.config.cronSecret}`;

    if (!authHeader || authHeader !== expectedToken) {
      throw new UnauthorizedException('Unauthorized');
    }

    const result = await this.cscService.syncCountriesIfStale();
    return {
      success: true,
      ...result,
    };
  }
}
