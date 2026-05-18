import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class AuthMigration1700000000001 implements MigrationInterface {
  name = 'AuthMigration1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'email', type: 'varchar', isUnique: true },
          { name: 'password_hash', type: 'varchar', isNullable: true },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'name', type: 'varchar', isNullable: true },
          { name: 'role', type: 'varchar', default: 'user' },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'email_verified', type: 'boolean', default: false },
          { name: 'phone_verified', type: 'boolean', default: false },
          { name: 'last_login', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'sessions',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'user_id', type: 'uuid' },
          { name: 'token', type: 'varchar', isUnique: true },
          { name: 'refresh_token', type: 'varchar', isNullable: true },
          { name: 'device_info', type: 'jsonb', isNullable: true },
          { name: 'ip_address', type: 'varchar', isNullable: true },
          { name: 'expires_at', type: 'timestamp' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'sessions',
      new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'oauth_providers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'user_id', type: 'uuid' },
          { name: 'provider', type: 'varchar' },
          { name: 'provider_id', type: 'varchar' },
          { name: 'access_token', type: 'text', isNullable: true },
          { name: 'refresh_token', type: 'text', isNullable: true },
          { name: 'expires_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'oauth_providers',
      new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'otps',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'user_id', type: 'uuid', isNullable: true },
          { name: 'email', type: 'varchar' },
          { name: 'otp', type: 'varchar' },
          { name: 'type', type: 'varchar' },
          { name: 'purpose', type: 'varchar' },
          { name: 'is_used', type: 'boolean', default: false },
          { name: 'expires_at', type: 'timestamp' },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('otps');
    await queryRunner.dropTable('oauth_providers');
    await queryRunner.dropTable('sessions');
    await queryRunner.dropTable('users');
  }
}