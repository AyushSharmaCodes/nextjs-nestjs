import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class ContentMigration1700000000007 implements MigrationInterface {
  name = 'ContentMigration1700000000007';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'blogs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'title', type: 'varchar' },
          { name: 'slug', type: 'varchar', isUnique: true },
          { name: 'content', type: 'text' },
          { name: 'excerpt', type: 'text', isNullable: true },
          { name: 'featured_image', type: 'varchar', isNullable: true },
          { name: 'author', type: 'varchar', isNullable: true },
          { name: 'is_published', type: 'boolean', default: false },
          { name: 'published_at', type: 'timestamp', isNullable: true },
          { name: 'meta_title', type: 'varchar', isNullable: true },
          { name: 'meta_description', type: 'text', isNullable: true },
          { name: 'tags', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'faqs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'question', type: 'varchar' },
          { name: 'answer', type: 'text' },
          { name: 'category', type: 'varchar', isNullable: true },
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
        name: 'galleries',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'title', type: 'varchar' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'cover_image', type: 'varchar', isNullable: true },
          { name: 'is_public', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'pages',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'title', type: 'varchar' },
          { name: 'slug', type: 'varchar', isUnique: true },
          { name: 'content', type: 'text' },
          { name: 'meta_title', type: 'varchar', isNullable: true },
          { name: 'meta_description', type: 'text', isNullable: true },
          { name: 'is_published', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'policies',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'title', type: 'varchar' },
          { name: 'slug', type: 'varchar', isUnique: true },
          { name: 'type', type: 'varchar' },
          { name: 'content', type: 'text' },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'testimonials',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'designation', type: 'varchar', isNullable: true },
          { name: 'company', type: 'varchar', isNullable: true },
          { name: 'avatar_url', type: 'varchar', isNullable: true },
          { name: 'message', type: 'text' },
          { name: 'rating', type: 'int', default: 5 },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'display_order', type: 'int', default: 0 },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'social_media',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'platform', type: 'varchar' },
          { name: 'url', type: 'varchar' },
          { name: 'icon', type: 'varchar', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'display_order', type: 'int', default: 0 },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'comments',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'content', type: 'text' },
          { name: 'entity_type', type: 'varchar' },
          { name: 'entity_id', type: 'uuid' },
          { name: 'user_id', type: 'uuid', isNullable: true },
          { name: 'parent_id', type: 'uuid', isNullable: true },
          { name: 'is_approved', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'countries',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'iso_code', type: 'varchar', isUnique: true },
          { name: 'iso_numeric', type: 'varchar', isNullable: true },
          { name: 'phone_code', type: 'varchar', isNullable: true },
          { name: 'currency', type: 'varchar', isNullable: true },
          { name: 'currency_symbol', type: 'varchar', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'states',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'country_id', type: 'uuid' },
          { name: 'iso_code', type: 'varchar', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'states',
      new TableForeignKey({ columnNames: ['country_id'], referencedTableName: 'countries', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'cities',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'state_id', type: 'uuid' },
          { name: 'is_active', type: 'boolean', default: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'cities',
      new TableForeignKey({ columnNames: ['state_id'], referencedTableName: 'states', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'pin_codes',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'code', type: 'varchar' },
          { name: 'city_id', type: 'uuid' },
          { name: 'is_serviceable', type: 'boolean', default: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'pin_codes',
      new TableForeignKey({ columnNames: ['city_id'], referencedTableName: 'cities', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'contact_info',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'key', type: 'varchar', isUnique: true },
          { name: 'value', type: 'varchar' },
          { name: 'type', type: 'varchar', default: 'GENERAL' },
          { name: 'is_public', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'bank_details',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'bank_name', type: 'varchar' },
          { name: 'account_name', type: 'varchar' },
          { name: 'account_number', type: 'varchar' },
          { name: 'ifsc_code', type: 'varchar' },
          { name: 'branch', type: 'varchar', isNullable: true },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'translations',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'namespace', type: 'varchar' },
          { name: 'key', type: 'varchar' },
          { name: 'language', type: 'varchar' },
          { name: 'value', type: 'text' },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'translation_metadata',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'language', type: 'varchar', isUnique: true },
          { name: 'name', type: 'varchar' },
          { name: 'is_default', type: 'boolean', default: false },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'display_order', type: 'int', default: 0 },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'about_cards',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'title', type: 'varchar', isNullable: true },
          { name: 'title_i18n', type: 'jsonb', isNullable: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'description_i18n', type: 'jsonb', isNullable: true },
          { name: 'icon', type: 'varchar', isNullable: true },
          { name: 'display_order', type: 'int', default: 0 },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'impact_stats',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'label', type: 'varchar', isNullable: true },
          { name: 'label_i18n', type: 'jsonb', isNullable: true },
          { name: 'value', type: 'varchar', isNullable: true },
          { name: 'icon', type: 'varchar', isNullable: true },
          { name: 'display_order', type: 'int', default: 0 },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'timeline_events',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'title', type: 'varchar', isNullable: true },
          { name: 'title_i18n', type: 'jsonb', isNullable: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'description_i18n', type: 'jsonb', isNullable: true },
          { name: 'year', type: 'varchar', isNullable: true },
          { name: 'display_order', type: 'int', default: 0 },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'team_members',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'name', type: 'varchar', isNullable: true },
          { name: 'name_i18n', type: 'jsonb', isNullable: true },
          { name: 'role', type: 'varchar', isNullable: true },
          { name: 'role_i18n', type: 'jsonb', isNullable: true },
          { name: 'bio', type: 'text', isNullable: true },
          { name: 'bio_i18n', type: 'jsonb', isNullable: true },
          { name: 'image_url', type: 'varchar', isNullable: true },
          { name: 'display_order', type: 'int', default: 0 },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'future_goals',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'title', type: 'varchar', isNullable: true },
          { name: 'title_i18n', type: 'jsonb', isNullable: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'description_i18n', type: 'jsonb', isNullable: true },
          { name: 'icon', type: 'varchar', isNullable: true },
          { name: 'display_order', type: 'int', default: 0 },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'about_settings',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'footer_description', type: 'text', isNullable: true },
          { name: 'footer_description_i18n', type: 'jsonb', isNullable: true },
          { name: 'section_visibility', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('about_settings');
    await queryRunner.dropTable('future_goals');
    await queryRunner.dropTable('team_members');
    await queryRunner.dropTable('timeline_events');
    await queryRunner.dropTable('impact_stats');
    await queryRunner.dropTable('about_cards');
    await queryRunner.dropTable('translation_metadata');
    await queryRunner.dropTable('translations');
    await queryRunner.dropTable('bank_details');
    await queryRunner.dropTable('contact_info');
    await queryRunner.dropTable('pin_codes');
    await queryRunner.dropTable('cities');
    await queryRunner.dropTable('states');
    await queryRunner.dropTable('countries');
    await queryRunner.dropTable('comments');
    await queryRunner.dropTable('social_media');
    await queryRunner.dropTable('testimonials');
    await queryRunner.dropTable('policies');
    await queryRunner.dropTable('pages');
    await queryRunner.dropTable('galleries');
    await queryRunner.dropTable('faqs');
    await queryRunner.dropTable('blogs');
  }
}