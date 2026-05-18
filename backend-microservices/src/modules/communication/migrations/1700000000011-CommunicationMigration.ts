import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CommunicationMigration1700000000011 implements MigrationInterface {
  name = 'CommunicationMigration1700000000011';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'email_templates',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'subject', type: 'varchar' },
          { name: 'body', type: 'text' },
          { name: 'type', type: 'varchar' },
          { name: 'is_active', type: 'boolean', default: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'email_queue',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'to_email', type: 'varchar' },
          { name: 'to_name', type: 'varchar', isNullable: true },
          { name: 'subject', type: 'varchar' },
          { name: 'body', type: 'text' },
          { name: 'template_id', type: 'uuid', isNullable: true },
          { name: 'status', type: 'varchar', default: 'PENDING' },
          { name: 'priority', type: 'varchar', default: 'NORMAL' },
          { name: 'attempts', type: 'int', default: 0 },
          { name: 'max_attempts', type: 'int', default: 3 },
          { name: 'sent_at', type: 'timestamp', isNullable: true },
          { name: 'failed_at', type: 'timestamp', isNullable: true },
          { name: 'error_message', type: 'text', isNullable: true },
          { name: 'metadata', type: 'jsonb', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'contact_messages',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'name', type: 'varchar' },
          { name: 'email', type: 'varchar' },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'subject', type: 'varchar', isNullable: true },
          { name: 'message', type: 'text' },
          { name: 'status', type: 'varchar', default: 'NEW' },
          { name: 'assigned_to', type: 'uuid', isNullable: true },
          { name: 'resolved_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'notifications',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'user_id', type: 'uuid' },
          { name: 'type', type: 'varchar' },
          { name: 'title', type: 'varchar' },
          { name: 'message', type: 'text' },
          { name: 'data', type: 'jsonb', isNullable: true },
          { name: 'is_read', type: 'boolean', default: false },
          { name: 'read_at', type: 'timestamp', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'notifications',
      new TableForeignKey({ columnNames: ['user_id'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'admin_alerts',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'title', type: 'varchar' },
          { name: 'message', type: 'text' },
          { name: 'type', type: 'varchar', default: 'INFO' },
          { name: 'severity', type: 'varchar', default: 'LOW' },
          { name: 'status', type: 'varchar', default: 'NEW' },
          { name: 'reference_id', type: 'varchar', isNullable: true },
          { name: 'reference_type', type: 'varchar', isNullable: true },
          { name: 'resolved_by', type: 'uuid', isNullable: true },
          { name: 'resolved_at', type: 'timestamp', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('admin_alerts');
    await queryRunner.dropTable('notifications');
    await queryRunner.dropTable('contact_messages');
    await queryRunner.dropTable('email_queue');
    await queryRunner.dropTable('email_templates');
  }
}