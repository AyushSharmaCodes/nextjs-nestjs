import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

import { AppConfigService } from '../../config/app-config.service';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);
  private readonly pool: Pool;

  constructor(private readonly appConfig: AppConfigService) {
    const connectionString = appConfig.databaseUrl;
    const pool = new Pool({ connectionString });
    const adapter = new PrismaPg(pool);
    super({
      adapter,
      log: ['query', 'info', 'warn', 'error'],
    });
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
    try {
      await this.$executeRawUnsafe(`SELECT 1 FROM app_auth.genders LIMIT 1`);
      this.logger.log('Gender and country joins migration already applied.');
    } catch (e: unknown) {
      this.logger.log('Genders table not found. Executing migration...');
      try {
        const fs = require('fs');
        const path = require('path');
        const sqlPath = path.join(__dirname, '../../../../src/migrations/20260523_gender_and_country_joins.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await this.$executeRawUnsafe(sql);
        this.logger.log('Migration completed successfully.');
      } catch (err: unknown) {
        this.logger.error('Failed to run migration:', err instanceof Error ? err.stack : err);
      }
    }

    try {
      await this.$executeRawUnsafe(`SELECT region_id FROM app_user.countries LIMIT 1`);
      this.logger.log('Countries cleanup migration already applied.');
    } catch (e: unknown) {
      this.logger.log('region_id not found in countries table. Executing cleanup migration...');
      try {
        const fs = require('fs');
        const path = require('path');
        const sqlPath = path.join(__dirname, '../../../../src/migrations/20260523_countries_schema_cleanup.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');
        await this.$executeRawUnsafe(sql);
        this.logger.log('Countries cleanup migration completed successfully.');
      } catch (err: unknown) {
        this.logger.error('Failed to run countries cleanup migration:', err instanceof Error ? err.stack : err);
      }
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    try {
      await this.pool.end();
      this.logger.log('Prisma database connection pool closed.');
    } catch (err: unknown) {
      this.logger.error('Failed to close Prisma database connection pool:', err);
    }
  }
}
