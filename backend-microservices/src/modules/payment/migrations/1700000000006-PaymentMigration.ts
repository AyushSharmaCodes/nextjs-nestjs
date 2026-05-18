import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class PaymentMigration1700000000006 implements MigrationInterface {
  name = 'PaymentMigration1700000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'order_id', type: 'uuid', isNullable: true },
          { name: 'user_id', type: 'uuid' },
          { name: 'amount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'currency', type: 'varchar', default: 'INR' },
          { name: 'status', type: 'varchar', default: 'PENDING' },
          { name: 'method', type: 'varchar', isNullable: true },
          { name: 'provider', type: 'varchar', default: 'RAZORPAY' },
          { name: 'provider_payment_id', type: 'varchar', isNullable: true },
          { name: 'provider_order_id', type: 'varchar', isNullable: true },
          { name: 'provider_refund_id', type: 'varchar', isNullable: true },
          { name: 'receipt', type: 'varchar', isNullable: true },
          { name: 'notes', type: 'jsonb', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'refunds',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'payment_id', type: 'uuid' },
          { name: 'order_id', type: 'uuid', isNullable: true },
          { name: 'amount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'currency', type: 'varchar', default: 'INR' },
          { name: 'status', type: 'varchar', default: 'PENDING' },
          { name: 'reason', type: 'varchar', isNullable: true },
          { name: 'provider_refund_id', type: 'varchar', isNullable: true },
          { name: 'processed_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'refunds',
      new TableForeignKey({ columnNames: ['payment_id'], referencedTableName: 'payments', referencedColumnNames: ['id'], onDelete: 'SET NULL' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'webhook_logs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'provider', type: 'varchar' },
          { name: 'event_type', type: 'varchar' },
          { name: 'payload', type: 'jsonb' },
          { name: 'signature', type: 'varchar', isNullable: true },
          { name: 'status', type: 'varchar', default: 'PENDING' },
          { name: 'processed_at', type: 'timestamp', isNullable: true },
          { name: 'retry_count', type: 'int', default: 0 },
          { name: 'error_message', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('webhook_logs');
    await queryRunner.dropTable('refunds');
    await queryRunner.dropTable('payments');
  }
}