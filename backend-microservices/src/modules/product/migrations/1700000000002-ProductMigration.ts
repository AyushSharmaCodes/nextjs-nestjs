import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class ProductMigration1700000000002 implements MigrationInterface {
  name = 'ProductMigration1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'categories',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'slug', type: 'varchar', isUnique: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'imageUrl', type: 'varchar', isNullable: true },
          { name: 'parentId', type: 'uuid', isNullable: true },
          { name: 'displayOrder', type: 'int', default: 0 },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'products',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'slug', type: 'varchar', isUnique: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'shortDescription', type: 'varchar', isNullable: true },
          { name: 'categoryId', type: 'uuid' },
          { name: 'brand', type: 'varchar', isNullable: true },
          { name: 'basePrice', type: 'decimal', precision: 10, scale: 2 },
          { name: 'sellingPrice', type: 'decimal', precision: 10, scale: 2 },
          { name: 'mrp', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'stockQuantity', type: 'int', default: 0 },
          { name: 'stockStatus', type: 'varchar', default: 'OUT_OF_STOCK' },
          { name: 'sku', type: 'varchar', isNullable: true },
          { name: 'barcode', type: 'varchar', isNullable: true },
          { name: 'weight', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'dimensions', type: 'jsonb', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'isFeatured', type: 'boolean', default: false },
          { name: 'metaTitle', type: 'varchar', isNullable: true },
          { name: 'metaDescription', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'products',
      new TableForeignKey({ columnNames: ['categoryId'], referencedTableName: 'categories', referencedColumnNames: ['id'], onDelete: 'SET NULL' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'productImages',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'productId', type: 'uuid' },
          { name: 'url', type: 'varchar' },
          { name: 'altText', type: 'varchar', isNullable: true },
          { name: 'displayOrder', type: 'int', default: 0 },
          { name: 'isPrimary', type: 'boolean', default: false },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'productImages',
      new TableForeignKey({ columnNames: ['productId'], referencedTableName: 'products', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'productVariants',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'productId', type: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'sku', type: 'varchar', isNullable: true },
          { name: 'price', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'stockQuantity', type: 'int', default: 0 },
          { name: 'attributes', type: 'jsonb', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'productVariants',
      new TableForeignKey({ columnNames: ['productId'], referencedTableName: 'products', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'inventoryLogs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'productId', type: 'uuid' },
          { name: 'variantId', type: 'uuid', isNullable: true },
          { name: 'quantityChange', type: 'int' },
          { name: 'reason', type: 'varchar' },
          { name: 'referenceId', type: 'varchar', isNullable: true },
          { name: 'createdBy', type: 'uuid', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'reviews',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'productId', type: 'uuid' },
          { name: 'userId', type: 'uuid' },
          { name: 'rating', type: 'int' },
          { name: 'title', type: 'varchar', isNullable: true },
          { name: 'comment', type: 'text', isNullable: true },
          { name: 'isVerified', type: 'boolean', default: false },
          { name: 'isApproved', type: 'boolean', default: true },
          { name: 'helpfulCount', type: 'int', default: 0 },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'reviews',
      new TableForeignKey({ columnNames: ['productId'], referencedTableName: 'products', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'deliveryZones',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'regions', type: 'jsonb', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'deliveryCharges',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'zoneId', type: 'uuid' },
          { name: 'minWeight', type: 'decimal', precision: 10, scale: 2 },
          { name: 'maxWeight', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'charge', type: 'decimal', precision: 10, scale: 2 },
          { name: 'estimatedDays', type: 'int', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'deliveryCharges',
      new TableForeignKey({ columnNames: ['zoneId'], referencedTableName: 'deliveryZones', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'deliveryPartners',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'apiKey', type: 'varchar', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('deliveryPartners');
    await queryRunner.dropTable('deliveryCharges');
    await queryRunner.dropTable('deliveryZones');
    await queryRunner.dropTable('reviews');
    await queryRunner.dropTable('inventoryLogs');
    await queryRunner.dropTable('productVariants');
    await queryRunner.dropTable('productImages');
    await queryRunner.dropTable('products');
    await queryRunner.dropTable('categories');
  }
}