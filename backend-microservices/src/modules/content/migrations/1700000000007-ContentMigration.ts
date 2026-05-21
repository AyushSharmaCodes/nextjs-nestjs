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
          { name: 'featuredImage', type: 'varchar', isNullable: true },
          { name: 'author', type: 'varchar', isNullable: true },
          { name: 'isPublished', type: 'boolean', default: false },
          { name: 'publishedAt', type: 'timestamp', isNullable: true },
          { name: 'metaTitle', type: 'varchar', isNullable: true },
          { name: 'metaDescription', type: 'text', isNullable: true },
          { name: 'tags', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
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
        name: 'galleries',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'title', type: 'varchar' },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'coverImage', type: 'varchar', isNullable: true },
          { name: 'isPublic', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
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
          { name: 'metaTitle', type: 'varchar', isNullable: true },
          { name: 'metaDescription', type: 'text', isNullable: true },
          { name: 'isPublished', type: 'boolean', default: false },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
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
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
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
          { name: 'avatarUrl', type: 'varchar', isNullable: true },
          { name: 'message', type: 'text' },
          { name: 'rating', type: 'int', default: 5 },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'displayOrder', type: 'int', default: 0 },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'socialMedia',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'platform', type: 'varchar' },
          { name: 'url', type: 'varchar' },
          { name: 'icon', type: 'varchar', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'displayOrder', type: 'int', default: 0 },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
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
          { name: 'entityType', type: 'varchar' },
          { name: 'entityId', type: 'uuid' },
          { name: 'userId', type: 'uuid', isNullable: true },
          { name: 'parentId', type: 'uuid', isNullable: true },
          { name: 'isApproved', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
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
          { name: 'isoCode', type: 'varchar', isUnique: true },
          { name: 'isoNumeric', type: 'varchar', isNullable: true },
          { name: 'phoneCode', type: 'varchar', isNullable: true },
          { name: 'currency', type: 'varchar', isNullable: true },
          { name: 'currencySymbol', type: 'varchar', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
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
          { name: 'countryId', type: 'uuid' },
          { name: 'isoCode', type: 'varchar', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'states',
      new TableForeignKey({ columnNames: ['countryId'], referencedTableName: 'countries', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'cities',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'stateId', type: 'uuid' },
          { name: 'isActive', type: 'boolean', default: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'cities',
      new TableForeignKey({ columnNames: ['stateId'], referencedTableName: 'states', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'pinCodes',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'code', type: 'varchar' },
          { name: 'cityId', type: 'uuid' },
          { name: 'isServiceable', type: 'boolean', default: true },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'pinCodes',
      new TableForeignKey({ columnNames: ['cityId'], referencedTableName: 'cities', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'contactInfo',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'key', type: 'varchar', isUnique: true },
          { name: 'value', type: 'varchar' },
          { name: 'type', type: 'varchar', default: 'GENERAL' },
          { name: 'isPublic', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'bankDetails',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'bankName', type: 'varchar' },
          { name: 'accountName', type: 'varchar' },
          { name: 'accountNumber', type: 'varchar' },
          { name: 'ifscCode', type: 'varchar' },
          { name: 'branch', type: 'varchar', isNullable: true },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
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
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'translationMetadata',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'language', type: 'varchar', isUnique: true },
          { name: 'name', type: 'varchar' },
          { name: 'isDefault', type: 'boolean', default: false },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'displayOrder', type: 'int', default: 0 },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'aboutCards',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'title', type: 'varchar', isNullable: true },
          { name: 'titleI18n', type: 'jsonb', isNullable: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'descriptionI18n', type: 'jsonb', isNullable: true },
          { name: 'icon', type: 'varchar', isNullable: true },
          { name: 'displayOrder', type: 'int', default: 0 },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'impactStats',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'label', type: 'varchar', isNullable: true },
          { name: 'labelI18n', type: 'jsonb', isNullable: true },
          { name: 'value', type: 'varchar', isNullable: true },
          { name: 'icon', type: 'varchar', isNullable: true },
          { name: 'displayOrder', type: 'int', default: 0 },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'timelineEvents',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'title', type: 'varchar', isNullable: true },
          { name: 'titleI18n', type: 'jsonb', isNullable: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'descriptionI18n', type: 'jsonb', isNullable: true },
          { name: 'year', type: 'varchar', isNullable: true },
          { name: 'displayOrder', type: 'int', default: 0 },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'teamMembers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'name', type: 'varchar', isNullable: true },
          { name: 'nameI18n', type: 'jsonb', isNullable: true },
          { name: 'role', type: 'varchar', isNullable: true },
          { name: 'roleI18n', type: 'jsonb', isNullable: true },
          { name: 'bio', type: 'text', isNullable: true },
          { name: 'bioI18n', type: 'jsonb', isNullable: true },
          { name: 'imageUrl', type: 'varchar', isNullable: true },
          { name: 'displayOrder', type: 'int', default: 0 },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'futureGoals',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'title', type: 'varchar', isNullable: true },
          { name: 'titleI18n', type: 'jsonb', isNullable: true },
          { name: 'description', type: 'text', isNullable: true },
          { name: 'descriptionI18n', type: 'jsonb', isNullable: true },
          { name: 'icon', type: 'varchar', isNullable: true },
          { name: 'displayOrder', type: 'int', default: 0 },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'aboutSettings',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'footerDescription', type: 'text', isNullable: true },
          { name: 'footerDescriptionI18n', type: 'jsonb', isNullable: true },
          { name: 'sectionVisibility', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('aboutSettings');
    await queryRunner.dropTable('futureGoals');
    await queryRunner.dropTable('teamMembers');
    await queryRunner.dropTable('timelineEvents');
    await queryRunner.dropTable('impactStats');
    await queryRunner.dropTable('aboutCards');
    await queryRunner.dropTable('translationMetadata');
    await queryRunner.dropTable('translations');
    await queryRunner.dropTable('bankDetails');
    await queryRunner.dropTable('contactInfo');
    await queryRunner.dropTable('pinCodes');
    await queryRunner.dropTable('cities');
    await queryRunner.dropTable('states');
    await queryRunner.dropTable('countries');
    await queryRunner.dropTable('comments');
    await queryRunner.dropTable('socialMedia');
    await queryRunner.dropTable('testimonials');
    await queryRunner.dropTable('policies');
    await queryRunner.dropTable('pages');
    await queryRunner.dropTable('galleries');
    await queryRunner.dropTable('faqs');
    await queryRunner.dropTable('blogs');
  }
}