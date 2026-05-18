import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('countries')
export class Country {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ unique: true }) code: string;
  @Column() name: string;
  @Column({ name: 'phone_code', type: 'varchar', nullable: true }) phoneCode: string | null;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('states')
export class State {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'country_id' }) countryId: string;
  @Column({ unique: true }) code: string;
  @Column() name: string;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('cities')
export class City {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'state_id' }) stateId: string;
  @Column({ name: 'country_id' }) countryId: string;
  @Column() name: string;
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true }) latitude: number | null;
  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true }) longitude: number | null;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('pin_codes')
export class PinCode {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() code: string;
  @Column({ name: 'city_id', type: 'uuid', nullable: true }) cityId: string | null;
  @Column({ name: 'city_name', type: 'varchar', nullable: true }) cityName: string | null;
  @Column({ name: 'state_id', type: 'uuid', nullable: true }) stateId: string | null;
  @Column({ name: 'state_name', type: 'varchar', nullable: true }) stateName: string | null;
  @Column({ name: 'country_id', type: 'uuid', nullable: true }) countryId: string | null;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}