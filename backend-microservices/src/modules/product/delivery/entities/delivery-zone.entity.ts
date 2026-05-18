import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('delivery_zones')
export class DeliveryZone {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column({ type: 'jsonb', nullable: true }) pinCodes: string[];
  @Column({ type: 'jsonb', nullable: true }) stateIds: string[];
  @Column({ type: 'jsonb', nullable: true }) cityIds: string[];
  @Column({ type: 'jsonb', nullable: true }) coordinates: any;
  @Column({ default: true }) isActive: boolean;
  @Column({ default: 0 }) priority: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('delivery_charges')
export class DeliveryCharge {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'zone_id' }) zoneId: string;
  @Column({ name: 'min_weight', default: 0 }) minWeight: number;
  @Column({ name: 'max_weight', type: 'numeric', precision: 10, scale: 2, nullable: true }) maxWeight: number | null;
  @Column({ type: 'decimal', precision: 10, scale: 2 }) charge: number;
  @Column({ name: 'delivery_days_min', default: 1 }) deliveryDaysMin: number;
  @Column({ name: 'delivery_days_max', default: 3 }) deliveryDaysMax: number;
  @Column({ default: true }) isActive: boolean;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}

@Entity('delivery_partners')
export class DeliveryPartner {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column() name: string;
  @Column() code: string;
  @Column({ type: 'varchar', nullable: true }) apiKey: string | null;
  @Column({ type: 'varchar', nullable: true }) trackingUrl: string | null;
  @Column({ default: true }) isActive: boolean;
  @Column({ default: 0 }) priority: number;
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date;
}