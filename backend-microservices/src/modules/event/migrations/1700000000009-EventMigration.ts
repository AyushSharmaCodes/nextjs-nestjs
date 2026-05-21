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
          { name: 'shortDescription', type: 'varchar', isNullable: true },
          { name: 'featuredImage', type: 'varchar', isNullable: true },
          { name: 'venue', type: 'varchar', isNullable: true },
          { name: 'startDate', type: 'timestamp' },
          { name: 'endDate', type: 'timestamp', isNullable: true },
          { name: 'registrationDeadline', type: 'timestamp', isNullable: true },
          { name: 'maxParticipants', type: 'int', isNullable: true },
          { name: 'currentParticipants', type: 'int', default: 0 },
          { name: 'isFree', type: 'boolean', default: true },
          { name: 'ticketPrice', type: 'decimal', precision: 10, scale: 2, isNullable: true },
          { name: 'isPublished', type: 'boolean', default: false },
          { name: 'metaTitle', type: 'varchar', isNullable: true },
          { name: 'metaDescription', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createTable(
      new Table({
        name: 'eventRegistrations',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'eventId', type: 'uuid' },
          { name: 'userId', type: 'uuid', isNullable: true },
          { name: 'name', type: 'varchar' },
          { name: 'email', type: 'varchar' },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'quantity', type: 'int', default: 1 },
          { name: 'totalAmount', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'status', type: 'varchar', default: 'CONFIRMED' },
          { name: 'paymentStatus', type: 'varchar', default: 'PENDING' },
          { name: 'paymentId', type: 'uuid', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'eventRegistrations',
      new TableForeignKey({ columnNames: ['eventId'], referencedTableName: 'events', referencedColumnNames: ['id'], onDelete: 'CASCADE' }),
    );

    await queryRunner.createTable(
      new Table({
        name: 'donations',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, isGenerated: true, generationStrategy: 'uuid' },
          { name: 'userId', type: 'uuid', isNullable: true },
          { name: 'amount', type: 'decimal', precision: 10, scale: 2 },
          { name: 'currency', type: 'varchar', default: 'INR' },
          { name: 'paymentStatus', type: 'varchar', default: 'PENDING' },
          { name: 'paymentId', type: 'uuid', isNullable: true },
          { name: 'paymentMethod', type: 'varchar', isNullable: true },
          { name: 'donorName', type: 'varchar', isNullable: true },
          { name: 'donorEmail', type: 'varchar', isNullable: true },
          { name: 'message', type: 'text', isNullable: true },
          { name: 'isAnonymous', type: 'boolean', default: false },
          { name: 'receiptUrl', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamp', default: 'now()' },
          { name: 'updatedAt', type: 'timestamp', default: 'now()' },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('donations');
    await queryRunner.dropTable('eventRegistrations');
    await queryRunner.dropTable('events');
  }
}