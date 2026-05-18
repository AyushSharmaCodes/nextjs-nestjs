import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class UserMigration1700000000005 implements MigrationInterface {
  name = 'UserMigration1700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'addresses',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'user_id', type: 'uuid' },
          { name: 'type', type: 'varchar', default: 'SHIPPING' },
          { name: 'name', type: 'varchar' },
          { name: 'phone', type: 'varchar' },
          { name: 'address_line1', type: 'varchar' },
          { name: 'address_line2', type: 'varchar', isNullable: true },
          { name: 'landmark', type: 'varchar', isNullable: true },
          { name: 'city', type: 'varchar' },
          { name: 'state', type: 'varchar' },
          { name: 'country', type: 'varchar', default: 'India' },
          { name: 'pincode', type: 'varchar' },
          { name: 'is_default', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'addresses',
      new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'profiles',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'first_name', type: 'varchar', isNullable: true },
          { name: 'last_name', type: 'varchar', isNullable: true },
          { name: 'avatar_url', type: 'varchar', isNullable: true },
          { name: 'date_of_birth', type: 'date', isNullable: true },
          { name: 'gender', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'managers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'user_id', type: 'uuid' },
          { name: 'role', type: 'varchar', default: 'STAFF' },
          { name: 'permissions', type: 'jsonb', default: '[]' },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'managers',
      new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'manager_permissions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'manager_id', type: 'uuid' },
          { name: 'resource', type: 'varchar' },
          { name: 'actions', type: 'jsonb' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'manager_permissions',
      new TableForeignKey({ columnNames: ['manager_id'], referencedTableName: 'managers', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'store_settings',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'key', type: 'varchar', isUnique: true },
          { name: 'value', type: 'text', isNullable: true },
          { name: 'type', type: 'varchar', default: 'STRING' },
          { name: 'is_public', type: 'boolean', default: false },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'account_deletions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'user_id', type: 'uuid' },
          { name: 'reason', type: 'text', isNullable: true },
          { name: 'status', type: 'varchar', default: 'PENDING' },
          { name: 'scheduled_at', type: 'timestamp' },
          { name: 'deleted_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('account_deletions');
    await queryRunner.dropTable('store_settings');
    await queryRunner.dropTable('manager_permissions');
    await queryRunner.dropTable('managers');
    await queryRunner.dropTable('profiles');
    await queryRunner.dropTable('addresses');
  }
}