import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class UserMigration1700000000005 implements MigrationInterface {
  name = 'UserMigration1700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'addresses',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'userId', type: 'uuid' },
          { name: 'type', type: 'varchar', default: 'SHIPPING' },
          { name: 'name', type: 'varchar' },
          { name: 'phone', type: 'varchar' },
          { name: 'addressLine1', type: 'varchar' },
          { name: 'addressLine2', type: 'varchar', isNullable: true },
          { name: 'landmark', type: 'varchar', isNullable: true },
          { name: 'city', type: 'varchar' },
          { name: 'state', type: 'varchar' },
          { name: 'country', type: 'varchar', default: 'India' },
          { name: 'pincode', type: 'varchar' },
          { name: 'isDefault', type: 'boolean', default: false },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'addresses',
      new TableForeignKey({ columnNames: ['userId'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'profiles',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true },
          { name: 'firstName', type: 'varchar', isNullable: true },
          { name: 'lastName', type: 'varchar', isNullable: true },
          { name: 'avatarUrl', type: 'varchar', isNullable: true },
          { name: 'dateOfBirth', type: 'date', isNullable: true },
          { name: 'gender', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'managers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'userId', type: 'uuid' },
          { name: 'role', type: 'varchar', default: 'STAFF' },
          { name: 'permissions', type: 'jsonb', default: '[]' },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'managers',
      new TableForeignKey({ columnNames: ['userId'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'manager_permissions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'managerId', type: 'uuid' },
          { name: 'resource', type: 'varchar' },
          { name: 'actions', type: 'jsonb' },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'manager_permissions',
      new TableForeignKey({ columnNames: ['managerId'], referencedTableName: 'managers', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'store_settings',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'key', type: 'varchar', isUnique: true },
          { name: 'value', type: 'text', isNullable: true },
          { name: 'type', type: 'varchar', default: 'STRING' },
          { name: 'isPublic', type: 'boolean', default: false },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'account_deletions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'userId', type: 'uuid' },
          { name: 'reason', type: 'text', isNullable: true },
          { name: 'status', type: 'varchar', default: 'PENDING' },
          { name: 'scheduledAt', type: 'timestamp' },
          { name: 'deletedAt', type: 'timestamp', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
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