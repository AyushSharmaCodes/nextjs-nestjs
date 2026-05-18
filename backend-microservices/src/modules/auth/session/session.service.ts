import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SessionRepository } from './session.repository';
import { JwtService } from './jwt/jwt.service';
import { IdentityRepository } from '../identity/identity.repository';
import { TokenResponse, SessionMetadata } from './dto/session.dto';

@Injectable()
export class SessionService {
  constructor(
    private readonly sessionRepo: SessionRepository,
    private readonly identityRepo: IdentityRepository,
    private readonly jwtService: JwtService,
  ) {}

  async createSession(identityId: string, metadata?: SessionMetadata): Promise<TokenResponse> {
    const identity = await this.identityRepo.findById(identityId);
    if (!identity) {
      throw new UnauthorizedException('Identity not found');
    }

    const activeSessions = await this.sessionRepo.countActiveSessions(identityId);
    if (activeSessions >= 5) {
      await this.sessionRepo.deleteOldestActiveSession(identityId);
    }

    const refreshToken = this.sessionRepo.generateRefreshToken();
    const session = await this.sessionRepo.create(
      identityId,
      refreshToken,
      metadata?.ipAddress,
      metadata?.deviceInfo,
    );

    const accessToken = await this.jwtService.generateAccessToken({
      userId: identity.id,
      email: identity.email,
      role: identity.role,
      sessionId: session.id,
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 3600,
    };
  }

  async refreshTokens(refreshToken: string, metadata?: SessionMetadata): Promise<TokenResponse> {
    const session = await this.sessionRepo.findByRefreshTokenHash(refreshToken);
    if (!session || !session.isActive) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (session.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    await this.sessionRepo.revoke(session.id);

    return this.createSession(session.identityId, metadata);
  }

  async logout(accessToken?: string, refreshToken?: string): Promise<void> {
    if (refreshToken) {
      const session = await this.sessionRepo.findByRefreshTokenHash(refreshToken);
      if (session) {
        await this.sessionRepo.revoke(session.id);
      }
    }
  }

  async getUserSessions(userId: string) {
    return this.sessionRepo.findByIdentity(userId);
  }

  async revokeSession(sessionId: string) {
    await this.sessionRepo.revoke(sessionId);
  }

  async revokeAllSessions(userId: string) {
    await this.sessionRepo.revokeAll(userId);
  }

  async getCurrentSession(sessionId: string) {
    const session = await this.sessionRepo.findById(sessionId);
    if (!session) {
      throw new UnauthorizedException('Session not found');
    }
    return session;
  }

  async registerTrustedDevice(userId: string, fingerprint: string, deviceName?: string) {
    return this.sessionRepo.saveTrustedDevice(userId, fingerprint, deviceName);
  }

  async getTrustedDevices(userId: string) {
    return this.sessionRepo.findTrustedDevices(userId);
  }

  async removeTrustedDevice(deviceId: string) {
    await this.sessionRepo.deleteTrustedDevice(deviceId);
  }
}