import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class OrderMigration1700000000004 implements MigrationInterface {
  name = 'OrderMigration1700000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'order_number', type: 'varchar', isUnique: true },
          { name: 'user_id', type: 'uuid' },
          { name: 'status', type: 'varchar', default: 'PENDING' },
          { name: 'payment_status', type: 'varchar', default: 'PENDING' },
          { name: 'payment_method', type: 'varchar', isNullable: true },
          { name: 'payment_id', type: 'varchar', isNullable: true },
          { name: 'subtotal', type: 'decimal', precision: 10, scale: 2 },
          { name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'shipping_amount', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'total_amount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'currency', type: 'varchar', default: 'INR' },
          { name: 'shipping_address', type: 'jsonb' },
          { name: 'billing_address', type: 'jsonb' },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'estimated_delivery', type: 'timestamp', isNullable: true },
          { name: 'shipped_at', type: 'timestamp', isNullable: true },
          { name: 'delivered_at', type: 'timestamp', isNullable: true },
          { name: 'cancelled_at', type: 'timestamp', isNullable: true },
          { name: 'cancellation_reason', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'order_items',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'order_id', type: 'uuid' },
          { name: 'product_id', type: 'uuid' },
          { name: 'variant_id', type: 'uuid', isNullable: true },
          { name: 'product_name', type: 'varchar' },
          { name: 'sku', type: 'varchar', isNullable: true },
          { name: 'quantity', type: 'int' },
          { name: 'unit_price', type: 'decimal', precision: 10, scale: 2 },
          { name: 'total_price', type: 'decimal', precision: 10, scale: 2 },
          { name: 'tax_amount', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({ columnNames: ['order_id'], referencedTableName: 'orders', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'returns',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'order_id', type: 'uuid' },
          { name: 'return_number', type: 'varchar', isUnique: true },
          { name: 'reason', type: 'varchar' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'status', type: 'varchar', default: 'PENDING' },
          { name: 'refund_amount', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'refund_method', type: 'varchar', isNullable: true },
          { name: 'pickup_address', type: 'jsonb', isNullable: true },
          { name: 'pickup_scheduled_at', type: 'timestamp', isNullable: true },
          { name: 'picked_up_at', type: 'timestamp', isNullable: true },
          { name: 'processed_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'returns',
      new TableForeignKey({ columnNames: ['order_id'], referencedTableName: 'orders', referencedColumnNames: ['id'], onDelete: 'SET NULL' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'return_items',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'return_id', type: 'uuid' },
          { name: 'order_item_id', type: 'uuid' },
          { name: 'quantity', type: 'int' },
          { name: 'condition', type: 'varchar', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'return_items',
      new TableForeignKey({ columnNames: ['return_id'], referencedTableName: 'returns', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'return_qc_results',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'return_item_id', type: 'uuid' },
          { name: 'status', type: 'varchar' },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'inspected_by', type: 'uuid', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'invoices',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'order_id', type: 'uuid' },
          { name: 'invoice_number', type: 'varchar', isUnique: true },
          { name: 'invoice_date', type: 'timestamp' },
          { name: 'due_date', type: 'timestamp', isNullable: true },
          { name: 'subtotal', type: 'decimal', precision: 10, scale: 2 },
          { name: 'tax_amount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'total_amount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'status', type: 'varchar', default: 'PENDING' },
          { name: 'paid_at', type: 'timestamp', isNullable: true },
          { name: 'pdf_url', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'invoices',
      new TableForeignKey({ columnNames: ['order_id'], referencedTableName: 'orders', referencedColumnNames: ['id'], onDelete: 'SET NULL' }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('invoices');
    await queryRunner.dropTable('return_qc_results');
    await queryRunner.dropTable('return_items');
    await queryRunner.dropTable('returns');
    await queryRunner.dropTable('order_items');
    await queryRunner.dropTable('orders');
  }
}