import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'identityId', unique: true })
  identityId: string;

  @Column({ name: 'firstName', type: 'varchar', length: 255, nullable: true })
  firstName: string | null;

  @Column({ name: 'lastName', type: 'varchar', length: 255, nullable: true })
  lastName: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ name: 'avatarUrl', type: 'text', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'preferredLanguage', length: 5, default: 'en' })
  preferredLanguage: string;

  @Column({ type: 'jsonb', default: {} })
  preferences: Record<string, unknown>;

  @Column({ name: 'defaultAddressId', type: 'uuid', nullable: true })
  defaultAddressId: string | null;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'userId' })
  userId: string;

  @Column({ length: 50, default: 'Home' })
  label: string;

  @Column({ name: 'fullName', length: 255 })
  fullName: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ name: 'addressLine1', length: 255 })
  addressLine1: string;

  @Column({ name: 'addressLine2', type: 'varchar', length: 255, nullable: true })
  addressLine2: string | null;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  state: string;

  @Column({ length: 10 })
  pincode: string;

  @Column({ length: 100, default: 'India' })
  country: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  landmark: string | null;

  @Column({ name: 'isPrimary', default: false })
  isPrimary: boolean;

  @Column({ name: 'addressType', length: 20, default: 'both' })
  addressType: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}