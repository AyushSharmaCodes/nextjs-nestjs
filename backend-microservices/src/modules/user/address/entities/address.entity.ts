import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('addresses')
export class Address {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'userId' })
  userId: string;

  @Column({ length: 100 })
  label: string;

  @Column({ length: 255 })
  fullName: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 255 })
  addressLine1: string;

  @Column({ length: 255, nullable: true })
  addressLine2: string;

  @Column({ length: 100 })
  city: string;

  @Column({ length: 100 })
  state: string;

  @Column({ length: 10 })
  pincode: string;

  @Column({ length: 50, nullable: true })
  country: string;

  @Column({ name: 'isPrimary', default: false })
  isPrimary: boolean;

  @Column({ name: 'addressType', length: 20, default: 'SHIPPING' })
  addressType: string;

  @CreateDateColumn({ name: 'createdAt' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updatedAt' })
  updatedAt: Date;
}