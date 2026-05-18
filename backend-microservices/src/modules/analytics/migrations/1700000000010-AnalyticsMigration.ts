import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AnalyticsMigration1700000000010 implements MigrationInterface {
  name = 'AnalyticsMigration1700000000010';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'audit_logs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'user_id', type: 'uuid', isNullable: true },
          { name: 'action', type: 'varchar' },
          { name: 'entity_type', type: 'varchar', isNullable: true },
          { name: 'entity_id', type: 'uuid', isNullable: true },
          { name: 'old_values', type: 'jsonb', isNullable: true },
          { name: 'new_values', type: 'jsonb', isNullable: true },
          { name: 'ip_address', type: 'varchar', isNullable: true },
          { name: 'user_agent', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
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
          { name: 'status_code', type: 'int' },
          { name: 'response_time', type: 'int' },
          { name: 'user_id', type: 'uuid', isNullable: true },
          { name: 'session_id', type: 'uuid', isNullable: true },
          { name: 'ip_address', type: 'varchar', isNullable: true },
          { name: 'user_agent', type: 'text', isNullable: true },
          { name: 'request_body', type: 'jsonb', isNullable: true },
          { name: 'response_body', type: 'text', isNullable: true },
          { name: 'error_message', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
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
          { name: 'user_id', type: 'uuid', isNullable: true },
          { name: 'payload', type: 'jsonb' },
          { name: 'is_broadcast', type: 'boolean', default: false },
          { name: 'expires_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'realtime_subscriptions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'user_id', type: 'uuid' },
          { name: 'channel', type: 'varchar' },
          { name: 'socket_id', type: 'varchar' },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
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