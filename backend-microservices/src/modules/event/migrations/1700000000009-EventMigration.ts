import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class EventMigration1700000000009 implements MigrationInterface {
  name = 'EventMigration1700000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'events',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'title', type: 'varchar' },
          { name: 'slug', type: 'varchar', isUnique: true },
          { name: 'description', type: 'text' },
          { name: 'short_description', type: 'varchar', isNullable: true },
          { name: 'featured_image', type: 'varchar', isNullable: true },
          { name: 'venue', type: 'varchar', isNullable: true },
          { name: 'start_date', type: 'timestamp' },
          { name: 'end_date', type: 'timestamp', isNullable: true },
          { name: 'registration_deadline', type: 'timestamp', isNullable: true },
          { name: 'max_participants', type: 'int', isNullable: true },
          { name: 'current_participants', type: 'int', default: 0 },
          { name: 'is_free', type: 'boolean', default: true },
          { name: 'ticket_price', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'is_published', type: 'boolean', default: false },
          { name: 'meta_title', type: 'varchar', isNullable: true },
          { name: 'meta_description', type: 'text', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'event_registrations',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'event_id', type: 'uuid' },
          { name: 'user_id', type: 'uuid', isNullable: true },
          { name: 'name', type: 'varchar' },
          { name: 'email', type: 'varchar' },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'quantity', type: 'int', default: 1 },
          { name: 'total_amount', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'status', type: 'varchar', default: 'CONFIRMED' },
          { name: 'payment_status', type: 'varchar', default: 'PENDING' },
          { name: 'payment_id', type: 'uuid', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'event_registrations',
      new TableForeignKey({ columnNames: ['event_id'], referencedTableName: 'events', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'donations',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'user_id', type: 'uuid', isNullable: true },
          { name: 'amount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'currency', type: 'varchar', default: 'INR' },
          { name: 'payment_status', type: 'varchar', default: 'PENDING' },
          { name: 'payment_id', type: 'uuid', isNullable: true },
          { name: 'payment_method', type: 'varchar', isNullable: true },
          { name: 'donor_name', type: 'varchar', isNullable: true },
          { name: 'donor_email', type: 'varchar', isNullable: true },
          { name: 'message', type: 'text', isNullable: true },
          { name: 'is_anonymous', type: 'boolean', default: false },
          { name: 'receipt_url', type: 'varchar', isNullable: true },
          { name: 'created_at', type: 'timestamp', default: 'now()' },
          { name: 'updated_at', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('donations');
    await queryRunner.dropTable('event_registrations');
    await queryRunner.dropTable('events');
  }
}