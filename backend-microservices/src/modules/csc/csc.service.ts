// src/modules/csc/csc.service.ts
import { Injectable, Logger, InternalServerErrorException, OnModuleInit } from '@nestjs/common';
import { AppConfigService } from '../../infrastructure/config/app-config.service';
import { CscRepository } from './csc.repository';
import { CscApiResponse } from './csc.types';

const SYNC_INTERVAL_DAYS = 30;

@Injectable()
export class CscService implements OnModuleInit {
  private readonly logger = new Logger(CscService.name);

  constructor(
    private readonly cscRepository: CscRepository,
    private readonly config: AppConfigService,
  ) {}

  async onModuleInit() {
    this.logger.log('CscModule initialized. Checking country database seed status...');
    try {
      const count = await this.cscRepository.count();
      if (count === 0) {
        this.logger.log('Countries table is empty. Initiating initial database seed from CSC API...');
        const countries = await this.fetchCountriesFromApi();
        const syncedAt = new Date();
        await this.cscRepository.upsertCountries(countries, syncedAt);
        this.logger.log(`Initial database seed completed successfully. Seeded ${countries.length} countries.`);
      } else {
        this.logger.log(`Countries table already seeded. Database contains ${count} country records.`);
      }
    } catch (error: unknown) {
      this.logger.error(
        `Failed to verify or seed countries database on startup. Error: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error.stack : ({} as { stack?: string }).stack
      );
      // Log the error but do not crash the application boot due to transient external API issues.
    }
  }

  async fetchCountriesFromApi(): Promise<CscApiResponse[]> {
    const baseUrl = this.config.countryApiBaseUrl;
    const apiKey = this.config.countryApiKey;
    const url = `${baseUrl}/countries`;

    this.logger.log(`Fetching countries from external API: ${url}`);
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-CSCAPI-KEY': apiKey,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error(
        `[country-sync] API request failed: ${response.status} ${response.statusText} — ${url}`
      );
    }

    const data = (await response.json()) as CscApiResponse[];

    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('[country-sync] API returned empty or invalid data.');
    }

    return data;
  }

  async isDataStale(): Promise<boolean> {
    const lastSynced = await this.cscRepository.findFirstSynced();

    if (!lastSynced) {
      return true; // table is empty -> stale
    }

    const lastSyncTime = new Date(lastSynced.syncedAt).getTime();
    const daysSinceSync = (Date.now() - lastSyncTime) / (1000 * 60 * 60 * 24);

    return daysSinceSync >= SYNC_INTERVAL_DAYS;
  }

  async syncCountriesIfStale() {
    const stale = await this.isDataStale();

    if (!stale) {
      const count = await this.cscRepository.count();
      return {
        synced: false,
        reason: 'fresh',
        count,
        syncedAt: null,
      };
    }

    try {
      const countries = await this.fetchCountriesFromApi();
      const syncedAt = new Date();
      await this.cscRepository.upsertCountries(countries, syncedAt);

      return {
        synced: true,
        reason: countries.length === 0 ? 'seeded' : 'refreshed',
        count: countries.length,
        syncedAt,
      };
    } catch (error: unknown) {
      this.logger.error('Failed to sync countries:', error);
      throw new InternalServerErrorException(
        error instanceof Error ? error.message : 'Unknown error during country sync'
      );
    }
  }

  async getCountriesFromDb() {
    return this.cscRepository.findManySortedByName();
  }
}
