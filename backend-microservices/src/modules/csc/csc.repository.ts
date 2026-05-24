// src/modules/csc/csc.repository.ts
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { CscApiResponse } from './csc.types';

@Injectable()
export class CscRepository {
  private readonly logger = new Logger(CscRepository.name);

  constructor(private readonly prisma: PrismaService) {}

  async findFirstSynced() {
    return this.prisma.country.findFirst({
      orderBy: { syncedAt: 'desc' },
      select: { syncedAt: true },
    });
  }

  async count() {
    return this.prisma.country.count();
  }

  async findManySortedByName() {
    return this.prisma.country.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async upsertCountries(countries: CscApiResponse[], syncedAt: Date): Promise<void> {
    this.logger.log(`Starting transactional database batch upsert for ${countries.length} countries (concurrently)...`);
    const startTime = Date.now();

    try {
      await this.prisma.$transaction(async (tx) => {
        const promises = countries.map((country) => {
          const countryId = Number(country.id);
          return tx.country.upsert({
            where: { id: countryId },
            create: {
              id: countryId,
              iso2: country.iso2,
              iso3: country.iso3,
              name: country.name,
              phonecode: country.phonecode,
              capital: country.capital || null,
              currency: country.currency || null,
              native: country.native || null,
              region: country.region || null,
              regionId: country.region_id ? Number(country.region_id) : null,
              subregion: country.subregion || null,
              subregionId: country.subregion_id ? Number(country.subregion_id) : null,
              timezones: country.timezones ? JSON.parse(JSON.stringify(country.timezones)) : null,
              latitude: country.latitude || null,
              longitude: country.longitude || null,
              emoji: country.emoji || null,
              syncedAt,
            },
            update: {
              iso2: country.iso2,
              iso3: country.iso3,
              name: country.name,
              phonecode: country.phonecode,
              capital: country.capital || null,
              currency: country.currency || null,
              native: country.native || null,
              region: country.region || null,
              regionId: country.region_id ? Number(country.region_id) : null,
              subregion: country.subregion || null,
              subregionId: country.subregion_id ? Number(country.subregion_id) : null,
              timezones: country.timezones ? JSON.parse(JSON.stringify(country.timezones)) : null,
              latitude: country.latitude || null,
              longitude: country.longitude || null,
              emoji: country.emoji || null,
              syncedAt,
            },
          });
        });

        await Promise.all(promises);
      }, {
        maxWait: 15000,
        timeout: 30000,
      });

      const duration = Date.now() - startTime;
      this.logger.log(`Database transaction COMMITTED successfully. Upserted ${countries.length} records in ${duration}ms.`);
    } catch (err: unknown) {
      const duration = Date.now() - startTime;
      this.logger.error(`Database transaction FAILED and ROLLED BACK after ${duration}ms. Error: ${err instanceof Error ? err.message : String(err)}`);
      throw err;
    }
  }
}
