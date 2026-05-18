import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuthIdentity } from './entities/oauth-identity.entity';
import { IdentityRepository } from '../identity/identity.repository';
import { v4 as uuidv4 } from 'uuid';

interface GoogleProfile {
  id: string;
  email: string;
  name?: string;
}

@Injectable()
export class OAuthRepository {
  constructor(
    @InjectRepository(OAuthIdentity)
    private readonly oauthRepo: Repository<OAuthIdentity>,
  ) {}

  async findByProviderAndProviderUserId(provider: string, providerUserId: string): Promise<OAuthIdentity | null> {
    return this.oauthRepo.findOne({
      where: { provider, providerUserId },
      relations: ['identity'],
    });
  }

  async create(data: Partial<OAuthIdentity>): Promise<OAuthIdentity> {
    const oauth = this.oauthRepo.create(data);
    return this.oauthRepo.save(oauth);
  }

  async update(id: string, data: Partial<OAuthIdentity>): Promise<OAuthIdentity> {
    await this.oauthRepo.update(id, data);
    const oauth = await this.oauthRepo.findOne({ where: { id } });
    return oauth!;
  }

  async deleteByIdentityId(identityId: string): Promise<void> {
    await this.oauthRepo.delete({ identityId });
  }
}