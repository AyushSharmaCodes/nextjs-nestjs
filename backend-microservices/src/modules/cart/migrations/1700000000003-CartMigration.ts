import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CartMigration1700000000003 implements MigrationInterface {
  name = 'CartMigration1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'carts',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'userId', type: 'uuid', isNullable: true },
          { name: 'sessionId', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'cart_items',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'cartId', type: 'uuid' },
          { name: 'productId', type: 'uuid' },
          { name: 'variantId', type: 'uuid', isNullable: true },
          { name: 'quantity', type: 'int', default: 1 },
          { name: 'unitPrice', type: 'decimal', precision: 10, scale: 2 },
          { name: 'totalPrice', type: 'decimal', precision: 10, scale: 2 },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'cart_items',
      new TableForeignKey({ columnNames: ['cartId'], referencedTableName: 'carts', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'coupons',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'code', type: 'varchar', isUnique: true },
          { name: 'type', type: 'varchar' },
          { name: 'value', type: 'decimal', precision: 10, scale: 2 },
          { name: 'minOrderValue', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'maxDiscount', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'usageLimit', type: 'int', isNullable: true },
          { name: 'usedCount', type: 'int', default: 0 },
          { name: 'userUsageLimit', type: 'int', default: 1 },
          { name: 'startsAt', type: 'timestamp' },
          { name: 'expiresAt', type: 'timestamp' },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'applicableProducts', type: 'jsonb', isNullable: true },
          { name: 'applicableCategories', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'applied_coupons',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'cartId', type: 'uuid' },
          { name: 'couponId', type: 'uuid' },
          { name: 'discountAmount', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'applied_coupons',
      new TableForeignKey({ columnNames: ['cartId'], referencedTableName: 'carts', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createForeignKey(
      'applied_coupons',
      new TableForeignKey({ columnNames: ['couponId'], referencedTableName: 'coupons', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('applied_coupons');
    await queryRunner.dropTable('coupons');
    await queryRunner.dropTable('cart_items');
    await queryRunner.dropTable('carts');
  }
}