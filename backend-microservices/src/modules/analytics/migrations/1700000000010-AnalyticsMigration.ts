import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AnalyticsMigration1700000000010 implements MigrationInterface {
  name = 'AnalyticsMigration1700000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'userId', type: 'uuid', isNullable: true },
          { name: 'action', type: 'varchar' },
          { name: 'entityType', type: 'varchar', isNullable: true },
          { name: 'entityId', type: 'uuid', isNullable: true },
          { name: 'oldValues', type: 'jsonb', isNullable: true },
          { name: 'newValues', type: 'jsonb', isNullable: true },
          { name: 'ipAddress', type: 'varchar', isNullable: true },
          { name: 'userAgent', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'request_logs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'method', type: 'varchar' },
          { name: 'path', type: 'varchar' },
          { name: 'statusCode', type: 'int' },
          { name: 'responseTime', type: 'int' },
          { name: 'userId', type: 'uuid', isNullable: true },
          { name: 'sessionId', type: 'uuid', isNullable: true },
          { name: 'ipAddress', type: 'varchar', isNullable: true },
          { name: 'userAgent', type: 'text', isNullable: true },
          { name: 'requestBody', type: 'jsonb', isNullable: true },
          { name: 'responseBody', type: 'text', isNullable: true },
          { name: 'errorMessage', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'realtime_events',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'event', type: 'varchar' },
          { name: 'channel', type: 'varchar' },
          { name: 'userId', type: 'uuid', isNullable: true },
          { name: 'payload', type: 'jsonb' },
          { name: 'isBroadcast', type: 'boolean', default: false },
          { name: 'expiresAt', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'realtime_subscriptions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'userId', type: 'uuid' },
          { name: 'channel', type: 'varchar' },
          { name: 'socketId', type: 'varchar' },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('realtime_subscriptions');
    await queryRunner.dropTable('realtime_events');
    await queryRunner.dropTable('request_logs');
    await queryRunner.dropTable('audit_logs');
  }
}