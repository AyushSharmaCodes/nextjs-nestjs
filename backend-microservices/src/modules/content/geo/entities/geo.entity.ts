import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) code: string;
  @Column() name: string;
  @Column({ name: 'phoneCode', type: 'varchar', nullable: true }) phoneCode: string | null;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
}

@Entity('states')
export class State {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'countryId' }) countryId: string;
  @Column({ unique: true }) code: string;
  @Column() name: string;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
}

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'stateId' }) stateId: string;
  @Column({ name: 'countryId' }) countryId: string;
  @Column() name: string;
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true }) latitude: number | null;
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true }) longitude: number | null;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
}

@Entity('pin_codes')
export class PinCode {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() code: string;
  @Column({ name: 'cityId', type: 'uuid', nullable: true }) cityId: string | null;
  @Column({ name: 'cityName', type: 'varchar', nullable: true }) cityName: string | null;
  @Column({ name: 'stateId', type: 'uuid', nullable: true }) stateId: string | null;
  @Column({ name: 'stateName', type: 'varchar', nullable: true }) stateName: string | null;
  @Column({ name: 'countryId', type: 'uuid', nullable: true }) countryId: string | null;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
}