import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CronMigration1700000000012 implements MigrationInterface {
  name = 'CronMigration1700000000012';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'cronJobs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'cronExpression', type: 'varchar' },
          { name: 'handler', type: 'varchar' },
          { name: 'payload', type: 'jsonb', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'timezone', type: 'varchar', default: 'Asia/Kolkata' },
          { name: 'lastRunAt', type: 'timestamp', isNullable: true },
          { name: 'nextRunAt', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'jobRuns',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'jobId', type: 'uuid' },
          { name: 'status', type: 'varchar', default: 'RUNNING' },
          { name: 'startedAt', type: 'timestamp', default: 'now()' },
          { name: 'completedAt', type: 'timestamp', isNullable: true },
          { name: 'errorMessage', type: 'text', isNullable: true },
          { name: 'result', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('jobRuns');
    await queryRunner.dropTable('cronJobs');
  }
}