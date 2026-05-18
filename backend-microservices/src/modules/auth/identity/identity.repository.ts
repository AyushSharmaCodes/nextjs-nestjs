import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Identity } from './entities/identity.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IdentityRepository {
  constructor(
    @InjectRepository(Identity)
    private readonly identityRepo: Repository<Identity>,
    @InjectRepository(PasswordResetToken)
    private readonly resetTokenRepo: Repository<PasswordResetToken>,
  ) {}

  async findByEmail(email: string): Promise<Identity | null> {
    return this.identityRepo.findOne({ where: { email: email.toLowerCase() } });
  }

  async findById(id: string): Promise<Identity | null> {
    return this.identityRepo.findOne({ where: { id } });
  }

  async create(data: Partial<Identity>): Promise<Identity> {
    const identity = this.identityRepo.create({
      ...data,
      email: (data.email ?? '').toLowerCase(),
    });
    return this.identityRepo.save(identity);
  }

  async update(id: string, data: Partial<Identity>): Promise<Identity> {
    await this.identityRepo.update(id, data);
    return this.findById(id) as Promise<Identity>;
  }

  async setPassword(id: string, password: string): Promise<void> {
    const hash = await bcrypt.hash(password, 12);
    await this.identityRepo.update(id, { passwordHash: hash });
  }

  async verifyPassword(id: string, password: string): Promise<boolean> {
    const identity = await this.findById(id);
    if (!identity?.passwordHash) return false;
    return bcrypt.compare(password, identity.passwordHash);
  }

  async createPasswordResetToken(identityId: string): Promise<string> {
    const token = uuidv4();
    const hash = await bcrypt.hash(token, 10);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.resetTokenRepo.save({
      identityId,
      tokenHash: hash,
      expiresAt,
    });
    return token;
  }

  async findValidResetToken(token: string): Promise<PasswordResetToken | null> {
    const tokens = await this.resetTokenRepo.find({
      where: { used: false },
      relations: ['identity'],
    });

    for (const t of tokens) {
      const valid = await bcrypt.compare(token, t.tokenHash);
      if (valid && t.expiresAt > new Date()) {
        return t;
      }
    }
    return null;
  }

  async markResetTokenUsed(token: PasswordResetToken): Promise<void> {
    await this.resetTokenRepo.update(token.id, { used: true });
  }

  async incrementLoginCount(id: string): Promise<void> {
    await this.identityRepo.increment({ id }, 'loginCount', 1);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.identityRepo.update(id, { lastLoginAt: new Date() });
  }

  async emailExists(email: string): Promise<boolean> {
    const count = await this.identityRepo.count({ where: { email: email.toLowerCase() } });
    return count > 0;
  }

  async hasPassword(identityId: string): Promise<boolean> {
    const identity = await this.findById(identityId);
    return !!identity?.passwordHash;
  }
}