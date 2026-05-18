import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AboutCard, ImpactStat, TimelineEvent, TeamMember, FutureGoal, AboutSettings } from './entities/about.entity';

@Injectable()
export class AboutService {
  constructor(
    @InjectRepository(AboutCard) private cardRepo: Repository<AboutCard>,
    @InjectRepository(ImpactStat) private statRepo: Repository<ImpactStat>,
    @InjectRepository(TimelineEvent) private timelineRepo: Repository<TimelineEvent>,
    @InjectRepository(TeamMember) private teamRepo: Repository<TeamMember>,
    @InjectRepository(FutureGoal) private goalRepo: Repository<FutureGoal>,
    @InjectRepository(AboutSettings) private settingsRepo: Repository<AboutSettings>,
  ) {}

  async getAllContent() {
    const [cards, stats, timeline, team, goals, settings] = await Promise.all([
      this.cardRepo.find({ order: { displayOrder: 'ASC' } }),
      this.statRepo.find({ order: { displayOrder: 'ASC' } }),
      this.timelineRepo.find({ order: { displayOrder: 'ASC' } }),
      this.teamRepo.find({ order: { displayOrder: 'ASC' } }),
      this.goalRepo.find({ order: { displayOrder: 'ASC' } }),
      this.settingsRepo.findOne({ where: { id: 'default' } }),
    ]);
    return { cards, stats, timeline, team, goals, settings };
  }

  async createCard(data: Partial<AboutCard>) {
    const card = this.cardRepo.create(data);
    return this.cardRepo.save(card);
  }

  async updateCard(id: string, data: Partial<AboutCard>) {
    await this.cardRepo.update(id, data);
    return this.cardRepo.findOne({ where: { id } });
  }

  async deleteCard(id: string) {
    return this.cardRepo.delete(id);
  }

  async createStat(data: Partial<ImpactStat>) {
    const stat = this.statRepo.create(data);
    return this.statRepo.save(stat);
  }

  async updateStat(id: string, data: Partial<ImpactStat>) {
    await this.statRepo.update(id, data);
    return this.statRepo.findOne({ where: { id } });
  }

  async deleteStat(id: string) {
    return this.statRepo.delete(id);
  }

  async createTimeline(data: Partial<TimelineEvent>) {
    const event = this.timelineRepo.create(data);
    return this.timelineRepo.save(event);
  }

  async updateTimeline(id: string, data: Partial<TimelineEvent>) {
    await this.timelineRepo.update(id, data);
    return this.timelineRepo.findOne({ where: { id } });
  }

  async deleteTimeline(id: string) {
    return this.timelineRepo.delete(id);
  }

  async createTeamMember(data: Partial<TeamMember>) {
    const member = this.teamRepo.create(data);
    return this.teamRepo.save(member);
  }

  async updateTeamMember(id: string, data: Partial<TeamMember>) {
    await this.teamRepo.update(id, data);
    return this.teamRepo.findOne({ where: { id } });
  }

  async deleteTeamMember(id: string) {
    return this.teamRepo.delete(id);
  }

  async createGoal(data: Partial<FutureGoal>) {
    const goal = this.goalRepo.create(data);
    return this.goalRepo.save(goal);
  }

  async updateGoal(id: string, data: Partial<FutureGoal>) {
    await this.goalRepo.update(id, data);
    return this.goalRepo.findOne({ where: { id } });
  }

  async deleteGoal(id: string) {
    return this.goalRepo.delete(id);
  }

  async updateSettings(data: Partial<AboutSettings>) {
    const existing = await this.settingsRepo.findOne({ where: { id: 'default' } });
    if (existing) {
      await this.settingsRepo.update(existing.id, data);
      return this.settingsRepo.findOne({ where: { id: existing.id } });
    }
    return this.settingsRepo.save(this.settingsRepo.create({ id: 'default', ...data }));
  }
}