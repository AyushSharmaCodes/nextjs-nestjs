import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CartMigration1700000000003 implements MigrationInterface {
  name = 'CartMigration1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'carts',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'user_id', type: 'uuid', isNullable: true },
          { name: 'session_id', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'cart_items',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'cart_id', type: 'uuid' },
          { name: 'product_id', type: 'uuid' },
          { name: 'variant_id', type: 'uuid', isNullable: true },
          { name: 'quantity', type: 'int', default: 1 },
          { name: 'unit_price', type: 'decimal', precision: 10, scale: 2 },
          { name: 'total_price', type: 'decimal', precision: 10, scale: 2 },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'cart_items',
      new TableForeignKey({ columnNames: ['cart_id'], referencedTableName: 'carts', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'coupons',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'code', type: 'varchar', isUnique: true },
          { name: 'type', type: 'varchar' },
          { name: 'value', type: 'decimal', precision: 10, scale: 2 },
          { name: 'min_order_value', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'max_discount', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'usage_limit', type: 'int', isNullable: true },
          { name: 'used_count', type: 'int', default: 0 },
          { name: 'user_usage_limit', type: 'int', default: 1 },
          { name: 'starts_at', type: 'timestamp' },
          { name: 'expires_at', type: 'timestamp' },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'applicable_products', type: 'jsonb', isNullable: true },
          { name: 'applicable_categories', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'applied_coupons',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'cart_id', type: 'uuid' },
          { name: 'coupon_id', type: 'uuid' },
          { name: 'discount_amount', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'applied_coupons',
      new TableForeignKey({ columnNames: ['cart_id'], referencedTableName: 'carts', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createForeignKey(
      'applied_coupons',
      new TableForeignKey({ columnNames: ['coupon_id'], referencedTableName: 'coupons', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('applied_coupons');
    await queryRunner.dropTable('coupons');
    await queryRunner.dropTable('cart_items');
    await queryRunner.dropTable('carts');
  }
}