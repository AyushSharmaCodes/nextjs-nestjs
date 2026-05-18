import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class StorageMigration1700000000008 implements MigrationInterface {
  name = 'StorageMigration1700000000008';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'files',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'filename', type: 'varchar' },
          { name: 'original_name', type: 'varchar' },
          { name: 'mime_type', type: 'varchar' },
          { name: 'size', type: 'bigint' },
          { name: 'url', type: 'varchar' },
          { name: 'path', type: 'varchar', isNullable: true },
          { name: 'bucket', type: 'varchar', default: 'public' },
          { name: 'uploaded_by', type: 'uuid', isNullable: true },
          { name: 'is_public', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('files');
  }
}