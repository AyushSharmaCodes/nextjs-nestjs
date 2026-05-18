import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Session } from './entities/session.entity';
import { TrustedDevice } from './entities/trusted-device.entity';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class SessionRepository {
  constructor(
    @InjectRepository(Session)
    private readonly sessionRepo: Repository<Session>,
    @InjectRepository(TrustedDevice)
    private readonly deviceRepo: Repository<TrustedDevice>,
  ) {}

  async create(identityId: string, refreshToken: string, ipAddress?: string, deviceInfo?: Record<string, unknown>): Promise<Session> {
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const session = this.sessionRepo.create({
      identityId,
      refreshTokenHash,
      ipAddress,
      deviceInfo,
      expiresAt,
    });
    return this.sessionRepo.save(session);
  }

  async findById(id: string): Promise<Session | null> {
    return this.sessionRepo.findOne({ where: { id }, relations: ['identity'] });
  }

  async findByRefreshTokenHash(hash: string): Promise<Session | null> {
    const sessions = await this.sessionRepo.find({
      where: { isActive: true },
      relations: ['identity'],
    });

    for (const session of sessions) {
      const valid = await bcrypt.compare(hash, session.refreshTokenHash);
      if (valid && session.expiresAt > new Date()) {
        return session;
      }
    }
    return null;
  }

  async revoke(id: string): Promise<void> {
    await this.sessionRepo.update(id, { isActive: false, revokedAt: new Date() });
  }

  async revokeAll(identityId: string): Promise<void> {
    await this.sessionRepo.update(
      { identityId, isActive: true },
      { isActive: false, revokedAt: new Date() },
    );
  }

  async findByIdentity(identityId: string): Promise<Session[]> {
    return this.sessionRepo.find({
      where: { identityId },
      order: { createdAt: 'DESC' },
    });
  }

  async countActiveSessions(identityId: string): Promise<number> {
    return this.sessionRepo.count({
      where: { identityId, isActive: true },
    });
  }

  async deleteOldestActiveSession(identityId: string): Promise<void> {
    const oldest = await this.sessionRepo.findOne({
      where: { identityId, isActive: true },
      order: { createdAt: 'ASC' },
    });
    if (oldest) {
      await this.revoke(oldest.id);
    }
  }

  async saveTrustedDevice(identityId: string, fingerprint: string, deviceName?: string): Promise<TrustedDevice> {
    const device = this.deviceRepo.create({
      identityId,
      deviceFingerprint: fingerprint,
      deviceName,
    });
    return this.deviceRepo.save(device);
  }

  async findTrustedDevices(identityId: string): Promise<TrustedDevice[]> {
    return this.deviceRepo.find({
      where: { identityId },
      order: { lastUsedAt: 'DESC' },
    });
  }

  async deleteTrustedDevice(id: string): Promise<void> {
    await this.deviceRepo.delete(id);
  }

  generateRefreshToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}