import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class OrderMigration1700000000004 implements MigrationInterface {
  name = 'OrderMigration1700000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'orderNumber', type: 'varchar', isUnique: true },
          { name: 'userId', type: 'uuid' },
          { name: 'status', type: 'varchar', default: 'PENDING' },
          { name: 'paymentStatus', type: 'varchar', default: 'PENDING' },
          { name: 'paymentMethod', type: 'varchar', isNullable: true },
          { name: 'paymentId', type: 'varchar', isNullable: true },
          { name: 'subtotal', type: 'decimal', precision: 10, scale: 2 },
          { name: 'taxAmount', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'shippingAmount', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'discountAmount', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'totalAmount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'currency', type: 'varchar', default: 'INR' },
          { name: 'shippingAddress', type: 'jsonb' },
          { name: 'billingAddress', type: 'jsonb' },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'estimatedDelivery', type: 'timestamp', isNullable: true },
          { name: 'shippedAt', type: 'timestamp', isNullable: true },
          { name: 'deliveredAt', type: 'timestamp', isNullable: true },
          { name: 'cancelledAt', type: 'timestamp', isNullable: true },
          { name: 'cancellationReason', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'orderItems',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'orderId', type: 'uuid' },
          { name: 'productId', type: 'uuid' },
          { name: 'variantId', type: 'uuid', isNullable: true },
          { name: 'productName', type: 'varchar' },
          { name: 'sku', type: 'varchar', isNullable: true },
          { name: 'quantity', type: 'int' },
          { name: 'unitPrice', type: 'decimal', precision: 10, scale: 2 },
          { name: 'totalPrice', type: 'decimal', precision: 10, scale: 2 },
          { name: 'taxAmount', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'discountAmount', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'orderItems',
      new TableForeignKey({ columnNames: ['orderId'], referencedTableName: 'orders', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'returns',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'orderId', type: 'uuid' },
          { name: 'returnNumber', type: 'varchar', isUnique: true },
          { name: 'reason', type: 'varchar' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'status', type: 'varchar', default: 'PENDING' },
          { name: 'refundAmount', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'refundMethod', type: 'varchar', isNullable: true },
          { name: 'pickupAddress', type: 'jsonb', isNullable: true },
          { name: 'pickupScheduledAt', type: 'timestamp', isNullable: true },
          { name: 'pickedUpAt', type: 'timestamp', isNullable: true },
          { name: 'processedAt', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'returns',
      new TableForeignKey({ columnNames: ['orderId'], referencedTableName: 'orders', referencedColumnNames: ['id'], onDelete: 'SET NULL' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'returnItems',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'returnId', type: 'uuid' },
          { name: 'orderItemId', type: 'uuid' },
          { name: 'quantity', type: 'int' },
          { name: 'condition', type: 'varchar', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'returnItems',
      new TableForeignKey({ columnNames: ['returnId'], referencedTableName: 'returns', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'returnQcResults',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'returnItemId', type: 'uuid' },
          { name: 'status', type: 'varchar' },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'inspectedBy', type: 'uuid', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'invoices',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'orderId', type: 'uuid' },
          { name: 'invoiceNumber', type: 'varchar', isUnique: true },
          { name: 'invoiceDate', type: 'timestamp' },
          { name: 'dueDate', type: 'timestamp', isNullable: true },
          { name: 'subtotal', type: 'decimal', precision: 10, scale: 2 },
          { name: 'taxAmount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'totalAmount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'status', type: 'varchar', default: 'PENDING' },
          { name: 'paidAt', type: 'timestamp', isNullable: true },
          { name: 'pdfUrl', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'invoices',
      new TableForeignKey({ columnNames: ['orderId'], referencedTableName: 'orders', referencedColumnNames: ['id'], onDelete: 'SET NULL' }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('invoices');
    await queryRunner.dropTable('returnQcResults');
    await queryRunner.dropTable('returnItems');
    await queryRunner.dropTable('returns');
    await queryRunner.dropTable('orderItems');
    await queryRunner.dropTable('orders');
  }
}