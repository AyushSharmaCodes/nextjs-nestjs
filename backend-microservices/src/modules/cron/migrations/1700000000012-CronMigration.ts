import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CronMigration1700000000012 implements MigrationInterface {
  name = 'CronMigration1700000000012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'cron_jobs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'cron_expression', type: 'varchar' },
          { name: 'handler', type: 'varchar' },
          { name: 'payload', type: 'jsonb', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'timezone', type: 'varchar', default: 'Asia/Kolkata' },
          { name: 'last_run_at', type: 'timestamp', isNullable: true },
          { name: 'next_run_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'job_runs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'job_id', type: 'uuid' },
          { name: 'status', type: 'varchar', default: 'RUNNING' },
          { name: 'started_at', type: 'timestamp', default: 'now()' },
          { name: 'completed_at', type: 'timestamp', isNullable: true },
          { name: 'error_message', type: 'text', isNullable: true },
          { name: 'result', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('job_runs');
    await queryRunner.dropTable('cron_jobs');
  }
}