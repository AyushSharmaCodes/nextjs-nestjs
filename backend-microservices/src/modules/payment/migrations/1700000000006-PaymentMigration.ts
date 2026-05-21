import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class PaymentMigration1700000000006 implements MigrationInterface {
  name = 'PaymentMigration1700000000006';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'payments',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'orderId', type: 'uuid', isNullable: true },
          { name: 'userId', type: 'uuid' },
          { name: 'amount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'currency', type: 'varchar', default: 'INR' },
          { name: 'status', type: 'varchar', default: 'PENDING' },
          { name: 'method', type: 'varchar', isNullable: true },
          { name: 'provider', type: 'varchar', default: 'RAZORPAY' },
          { name: 'providerPaymentId', type: 'varchar', isNullable: true },
          { name: 'providerOrderId', type: 'varchar', isNullable: true },
          { name: 'providerRefundId', type: 'varchar', isNullable: true },
          { name: 'receipt', type: 'varchar', isNullable: true },
          { name: 'notes', type: 'jsonb', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'refunds',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'paymentId', type: 'uuid' },
          { name: 'orderId', type: 'uuid', isNullable: true },
          { name: 'amount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'currency', type: 'varchar', default: 'INR' },
          { name: 'status', type: 'varchar', default: 'PENDING' },
          { name: 'reason', type: 'varchar', isNullable: true },
          { name: 'providerRefundId', type: 'varchar', isNullable: true },
          { name: 'processedAt', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'refunds',
      new TableForeignKey({ columnNames: ['paymentId'], referencedTableName: 'payments', referencedColumnNames: ['id'], onDelete: 'SET NULL' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'webhookLogs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'provider', type: 'varchar' },
          { name: 'eventType', type: 'varchar' },
          { name: 'payload', type: 'jsonb' },
          { name: 'signature', type: 'varchar', isNullable: true },
          { name: 'status', type: 'varchar', default: 'PENDING' },
          { name: 'processedAt', type: 'timestamp', isNullable: true },
          { name: 'retryCount', type: 'int', default: 0 },
          { name: 'errorMessage', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('webhookLogs');
    await queryRunner.dropTable('refunds');
    await queryRunner.dropTable('payments');
  }
}