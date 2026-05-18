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
          { name: 'image_url', type: 'varchar', isNullable: true },
          { name: 'parent_id', type: 'uuid', isNullable: true },
          { name: 'display_order', type: 'int', default: 0 },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
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
          { name: 'short_description', type: 'varchar', isNullable: true },
          { name: 'category_id', type: 'uuid' },
          { name: 'brand', type: 'varchar', isNullable: true },
          { name: 'base_price', type: 'decimal', precision: 10, scale: 2 },
          { name: 'selling_price', type: 'decimal', precision: 10, scale: 2 },
          { name: 'mrp', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'stock_quantity', type: 'int', default: 0 },
          { name: 'stock_status', type: 'varchar', default: 'OUT_OF_STOCK' },
          { name: 'sku', type: 'varchar', isNullable: true },
          { name: 'barcode', type: 'varchar', isNullable: true },
          { name: 'weight', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'dimensions', type: 'jsonb', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'is_featured', type: 'boolean', default: false },
          { name: 'meta_title', type: 'varchar', isNullable: true },
          { name: 'meta_description', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'products',
      new TableForeignKey({ columnNames: ['category_id'], referencedTableName: 'categories', referencedColumnNames: ['id'], onDelete: 'SET NULL' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'product_images',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'product_id', type: 'uuid' },
          { name: 'url', type: 'varchar' },
          { name: 'alt_text', type: 'varchar', isNullable: true },
          { name: 'display_order', type: 'int', default: 0 },
          { name: 'is_primary', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'product_images',
      new TableForeignKey({ columnNames: ['product_id'], referencedTableName: 'products', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'product_variants',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'product_id', type: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'sku', type: 'varchar', isNullable: true },
          { name: 'price', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'stock_quantity', type: 'int', default: 0 },
          { name: 'attributes', type: 'jsonb', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'product_variants',
      new TableForeignKey({ columnNames: ['product_id'], referencedTableName: 'products', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'inventory_logs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'product_id', type: 'uuid' },
          { name: 'variant_id', type: 'uuid', isNullable: true },
          { name: 'quantity_change', type: 'int' },
          { name: 'reason', type: 'varchar' },
          { name: 'reference_id', type: 'varchar', isNullable: true },
          { name: 'created_by', type: 'uuid', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'reviews',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'product_id', type: 'uuid' },
          { name: 'user_id', type: 'uuid' },
          { name: 'rating', type: 'int' },
          { name: 'title', type: 'varchar', isNullable: true },
          { name: 'comment', type: 'text', isNullable: true },
          { name: 'is_verified', type: 'boolean', default: false },
          { name: 'is_approved', type: 'boolean', default: true },
          { name: 'helpful_count', type: 'int', default: 0 },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'reviews',
      new TableForeignKey({ columnNames: ['product_id'], referencedTableName: 'products', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'delivery_zones',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'regions', type: 'jsonb', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'delivery_charges',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'zone_id', type: 'uuid' },
          { name: 'min_weight', type: 'decimal', precision: 10, scale: 2 },
          { name: 'max_weight', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'charge', type: 'decimal', precision: 10, scale: 2 },
          { name: 'estimated_days', type: 'int', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'delivery_charges',
      new TableForeignKey({ columnNames: ['zone_id'], referencedTableName: 'delivery_zones', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'delivery_partners',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'api_key', type: 'varchar', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('delivery_partners');
    await queryRunner.dropTable('delivery_charges');
    await queryRunner.dropTable('delivery_zones');
    await queryRunner.dropTable('reviews');
    await queryRunner.dropTable('inventory_logs');
    await queryRunner.dropTable('product_variants');
    await queryRunner.dropTable('product_images');
    await queryRunner.dropTable('products');
    await queryRunner.dropTable('categories');
  }
}