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
          { name: 'originalName', type: 'varchar' },
          { name: 'mimeType', type: 'varchar' },
          { name: 'size', type: 'bigint' },
          { name: 'url', type: 'varchar' },
          { name: 'path', type: 'varchar', isNullable: true },
          { name: 'bucket', type: 'varchar', default: 'public' },
          { name: 'uploadedBy', type: 'uuid', isNullable: true },
          { name: 'isPublic', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('files');
  }
}