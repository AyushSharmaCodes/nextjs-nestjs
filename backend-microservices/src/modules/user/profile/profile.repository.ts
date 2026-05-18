import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile } from './entities/profile.entity';

@Injectable()
export class ProfileRepository {
  constructor(
    @InjectRepository(Profile) private profileRepo: Repository<Profile>,
  ) {}

  async findByIdentityId(identityId: string) {
    return this.profileRepo.findOne({ where: { identityId } });
  }

  async findById(id: string) {
    return this.profileRepo.findOne({ where: { id } });
  }

  async create(identityId: string) {
    const profile = this.profileRepo.create({ identityId });
    return this.profileRepo.save(profile);
  }

  async update(id: string, data: Partial<Profile>) {
    await this.profileRepo.update(id, data as any);
    return this.findById(id);
  }
}