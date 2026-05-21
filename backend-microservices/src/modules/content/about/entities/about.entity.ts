import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('about_cards')
export class AboutCard {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', nullable: true }) title: string | null;
  @Column({ type: 'jsonb', nullable: true }) titleI18n: Record<string, string> | null;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ name: 'descriptionI18n', type: 'jsonb', nullable: true }) descriptionI18n: Record<string, string> | null;
  @Column({ type: 'varchar', nullable: true }) icon: string | null;
  @Column({ name: 'displayOrder', default: 0 }) displayOrder: number;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updatedAt' }) updatedAt: Date;
}

@Entity('impact_stats')
export class ImpactStat {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', nullable: true }) label: string | null;
  @Column({ name: 'labelI18n', type: 'jsonb', nullable: true }) labelI18n: Record<string, string> | null;
  @Column({ type: 'varchar', nullable: true }) value: string | null;
  @Column({ type: 'varchar', nullable: true }) icon: string | null;
  @Column({ name: 'displayOrder', default: 0 }) displayOrder: number;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updatedAt' }) updatedAt: Date;
}

@Entity('timeline_events')
export class TimelineEvent {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', nullable: true }) title: string | null;
  @Column({ name: 'titleI18n', type: 'jsonb', nullable: true }) titleI18n: Record<string, string> | null;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ name: 'descriptionI18n', type: 'jsonb', nullable: true }) descriptionI18n: Record<string, string> | null;
  @Column({ type: 'varchar', nullable: true }) year: string | null;
  @Column({ name: 'displayOrder', default: 0 }) displayOrder: number;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updatedAt' }) updatedAt: Date;
}

@Entity('team_members')
export class TeamMember {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', nullable: true }) name: string | null;
  @Column({ name: 'nameI18n', type: 'jsonb', nullable: true }) nameI18n: Record<string, string> | null;
  @Column({ type: 'varchar', nullable: true }) role: string | null;
  @Column({ name: 'roleI18n', type: 'jsonb', nullable: true }) roleI18n: Record<string, string> | null;
  @Column({ type: 'text', nullable: true }) bio: string | null;
  @Column({ name: 'bioI18n', type: 'jsonb', nullable: true }) bioI18n: Record<string, string> | null;
  @Column({ name: 'imageUrl', type: 'varchar', nullable: true }) imageUrl: string | null;
  @Column({ name: 'displayOrder', default: 0 }) displayOrder: number;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updatedAt' }) updatedAt: Date;
}

@Entity('future_goals')
export class FutureGoal {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ type: 'varchar', nullable: true }) title: string | null;
  @Column({ name: 'titleI18n', type: 'jsonb', nullable: true }) titleI18n: Record<string, string> | null;
  @Column({ type: 'text', nullable: true }) description: string | null;
  @Column({ name: 'descriptionI18n', type: 'jsonb', nullable: true }) descriptionI18n: Record<string, string> | null;
  @Column({ type: 'varchar', nullable: true }) icon: string | null;
  @Column({ name: 'displayOrder', default: 0 }) displayOrder: number;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updatedAt' }) updatedAt: Date;
}

@Entity('about_settings')
export class AboutSettings {
  @PrimaryGeneratedColumn('uuid') id: string;
  @Column({ name: 'footerDescription', type: 'text', nullable: true }) footerDescription: string | null;
  @Column({ name: 'footerDescriptionI18n', type: 'jsonb', nullable: true }) footerDescriptionI18n: Record<string, string> | null;
  @Column({ name: 'sectionVisibility', type: 'jsonb', nullable: true }) sectionVisibility: Record<string, boolean> | null;
  @CreateDateColumn({ name: 'createdAt' }) createdAt: Date;
  @UpdateDateColumn({ name: 'updatedAt' }) updatedAt: Date;
}