import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('profiles')
export class Profile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'identity_id', unique: true })
  identityId: string;

  @Column({ name: 'full_name', type: 'varchar', length: 255, nullable: true })
  fullName: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string | null;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl: string | null;

  @Column({ name: 'preferred_language', length: 5, default: 'en' })
  preferredLanguage: string;

  @Column({ type: 'jsonb', default: {} })
  preferences: Record<string, unknown>;

  @Column({ name: 'default_address_id', type: 'uuid', nullable: true })
  defaultAddressId: string | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'user_id' })
  userId: string;

  @Column({ length: 50, default: 'Home' })
  label: string;

  @Column({ name: 'full_name', length: 255 })
  fullName: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ name: 'address_line1', length: 255 })
  addressLine1: string;

  @Column({ name: 'address_line2', type: 'varchar', length: 255, nullable: true })
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

  @Column({ name: 'is_primary', default: false })
  isPrimary: boolean;

  @Column({ name: 'address_type', length: 20, default: 'both' })
  addressType: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}