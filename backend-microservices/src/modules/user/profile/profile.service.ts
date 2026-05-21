import { Injectable } from '@nestjs/common';
import { ProfileRepository } from './profile.repository';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepo: ProfileRepository) {}

  async getProfile(identityId: string) {
    let profile = await this.profileRepo.findByIdentityId(identityId);
    if (!profile) profile = await this.profileRepo.create(identityId);
    return profile;
  }

  async updateProfile(identityId: string, data: { firstName?: string; lastName?: string; phone?: string; avatarUrl?: string; preferredLanguage?: string; preferences?: Record<string, unknown> }) {
    let profile = await this.profileRepo.findByIdentityId(identityId);
    if (!profile) profile = await this.profileRepo.create(identityId);
    return this.profileRepo.update(profile.id, data);
  }
}