import { Injectable, ConflictException, NotFoundException, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { IdentityRepository } from './identity.repository';
import { RegisterDto } from './dto';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class IdentityService {
  constructor(private readonly identityRepo: IdentityRepository) {}

  async register(data: RegisterDto) {
    const exists = await this.identityRepo.emailExists(data.email);
    if (exists) {
      throw new ConflictException('Email already exists');
    }

    const emailVerificationToken = uuidv4();
    const emailVerificationExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    const identity = await this.identityRepo.create({
      email: data.email,
      role: (data.role === 'admin' || data.role === 'manager' || data.role === 'customer') ? data.role : 'customer',
      authProvider: 'local',
      emailVerificationToken,
      emailVerificationExpiresAt,
      emailVerified: data.isEmailVerified || false,
    });

    if (data.password) {
      const hash = await bcrypt.hash(data.password, 12);
      await this.identityRepo.update(identity.id, { passwordHash: hash });
    }

    return {
      id: identity.id,
      email: identity.email,
      role: identity.role,
    };
  }

  async verifyCredentials(email: string, password: string): Promise<{ success: boolean; identityId?: string; error?: string; retryAfter?: number }> {
    const identity = await this.identityRepo.findByEmail(email);

    if (!identity) {
      return { success: false, error: 'Invalid credentials' };
    }

    if (identity.isBlocked) {
      return { success: false, error: 'Account is blocked' };
    }

    if (!identity.passwordHash) {
      return { success: false, error: 'Use Google OAuth to login' };
    }

    const valid = await bcrypt.compare(password, identity.passwordHash);
    if (!valid) {
      return { success: false, error: 'Invalid credentials' };
    }

    return { success: true, identityId: identity.id };
  }

  async checkEmailExists(email: string): Promise<boolean> {
    return this.identityRepo.emailExists(email);
  }

  async getIdentityById(id: string) {
    const identity = await this.identityRepo.findById(id);
    if (!identity) {
      throw new NotFoundException('User not found');
    }
    return identity;
  }

  async changePassword(identityId: string, currentPassword: string, newPassword: string): Promise<void> {
    const valid = await this.identityRepo.verifyPassword(identityId, currentPassword);
    if (!valid) {
      throw new BadRequestException('Current password is incorrect');
    }
    await this.identityRepo.setPassword(identityId, newPassword);
  }

  async requestPasswordReset(email: string): Promise<{ exists: boolean }> {
    const identity = await this.identityRepo.findByEmail(email);
    if (!identity) {
      return { exists: false };
    }
    await this.identityRepo.createPasswordResetToken(identity.id);
    return { exists: true };
  }

  async validateResetToken(token: string): Promise<boolean> {
    const tokenRecord = await this.identityRepo.findValidResetToken(token);
    return !!tokenRecord;
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenRecord = await this.identityRepo.findValidResetToken(token);
    if (!tokenRecord) {
      throw new BadRequestException('Invalid or expired token');
    }
    await this.identityRepo.setPassword(tokenRecord.identityId, newPassword);
    await this.identityRepo.markResetTokenUsed(tokenRecord);
  }

  async hasPassword(identityId: string): Promise<boolean> {
    return this.identityRepo.hasPassword(identityId);
  }
}