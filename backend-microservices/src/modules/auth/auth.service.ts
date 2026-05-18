import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { OtpService } from './otp/otp.service';
import { RegisterDto, LoginDto, VerifyOtpDto } from './dto/auth.dto';
import * as bcryptjs from 'bcryptjs';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { ErrorCode, getErrorResponse } from '../../common/constants/error-codes';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private otpService: OtpService,
    private configService: ConfigService,
  ) {}

  private async logSecurityEvent(params: {
    userId?: string;
    email?: string;
    eventType: string;
    status: 'SUCCESS' | 'FAILURE';
    ipAddress?: string;
    userAgent?: string;
    metadata?: Record<string, string | number | boolean>;
  }) {
    await this.prisma.securityEvent.create({
      data: {
        userId: params.userId,
        email: params.email,
        eventType: params.eventType,
        status: params.status,
        ipAddress: params.ipAddress,
        userAgent: params.userAgent,
        metadata: params.metadata,
      },
    });
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) {
      throw new BadRequestException(getErrorResponse(ErrorCode.AUTH_EMAIL_EXISTS));
    }

    const passwordHash = await bcryptjs.hash(dto.password, 12);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
      },
    });

    // Automatically send verification OTP
    await this.otpService.createChallenge(user.id, user.email, 'EMAIL_VERIFICATION');

    await this.logSecurityEvent({
      userId: user.id,
      email: user.email,
      eventType: 'AUTH_REGISTER',
      status: 'SUCCESS',
    });

    return {
      message: 'Registration successful. Please check your email for the OTP.',
      userId: user.id,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user || !user.passwordHash) {
      await this.logSecurityEvent({
        email: dto.email,
        eventType: 'AUTH_LOGIN',
        status: 'FAILURE',
        metadata: { reason: 'INVALID_CREDENTIALS' },
      });
      throw new UnauthorizedException(getErrorResponse(ErrorCode.AUTH_INVALID_CREDENTIALS));
    }

    const isMatch = await bcryptjs.compare(dto.password, user.passwordHash);
    if (!isMatch) {
      await this.logSecurityEvent({
        userId: user.id,
        email: user.email,
        eventType: 'AUTH_LOGIN',
        status: 'FAILURE',
        metadata: { reason: 'INVALID_CREDENTIALS' },
      });
      throw new UnauthorizedException(getErrorResponse(ErrorCode.AUTH_INVALID_CREDENTIALS));
    }

    if (!user.emailVerified) {
      await this.otpService.createChallenge(user.id, user.email, 'EMAIL_VERIFICATION');
      throw new UnauthorizedException(getErrorResponse(ErrorCode.AUTH_EMAIL_NOT_VERIFIED));
    }

    // Trigger OTP challenge for login
    await this.otpService.createChallenge(user.id, user.email, 'LOGIN');

    await this.logSecurityEvent({
      userId: user.id,
      email: user.email,
      eventType: 'AUTH_LOGIN_OTP_CHALLENGE',
      status: 'SUCCESS',
    });

    return {
      message: 'Credentials valid. Please enter the OTP sent to your email.',
      requiresOtp: true,
      userId: user.id,
    };
  }

  async verifyOtp(dto: VerifyOtpDto, type: 'EMAIL_VERIFICATION' | 'LOGIN', userAgent?: string, ipAddress?: string) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException(getErrorResponse(ErrorCode.UNAUTHORIZED, 'Invalid user'));
    }

    await this.otpService.verifyChallenge(user.id, dto.otp, type);

    await this.logSecurityEvent({
      userId: user.id,
      email: user.email,
      eventType: `AUTH_OTP_VERIFY_${type}`,
      status: 'SUCCESS',
      ipAddress,
      userAgent,
    });

    if (type === 'EMAIL_VERIFICATION') {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { emailVerified: true },
      });
      return { message: 'Email verified successfully. You can now login.' };
    }

    // LOGIN flow - Generate Tokens
    return this.generateTokens(user.id, userAgent, ipAddress);
  }

  async resendOtp(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException(getErrorResponse(ErrorCode.UNAUTHORIZED, 'Invalid user'));
    }

    const type = user.emailVerified ? 'LOGIN' : 'EMAIL_VERIFICATION';
    await this.otpService.createChallenge(user.id, user.email, type);

    await this.logSecurityEvent({
      userId: user.id,
      email: user.email,
      eventType: 'AUTH_OTP_RESEND',
      status: 'SUCCESS',
      metadata: { type },
    });

    return { message: 'OTP resent successfully.' };
  }

  private async generateTokens(userId: string, userAgent?: string, ipAddress?: string) {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: { role: true },
    });

    const roles = userRoles.map(ur => ur.role.name);

    const payload = { sub: userId, roles };
    
    const privateKey = this.configService.get<string>('JWT_PRIVATE_KEY');
    const secretKey = this.configService.get<string>('JWT_SECRET');

    if (!privateKey || !secretKey) {
      throw new Error('JWT_PRIVATE_KEY and JWT_SECRET must both be set in production');
    }

    const secretOrKey = Buffer.from(privateKey, 'base64').toString('ascii');
    const accessToken = this.jwtService.sign(payload, { secret: secretOrKey, algorithm: 'RS256', expiresIn: '15m' });
    const refreshToken = crypto.randomBytes(40).toString('hex');
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash,
        userAgent,
        ipAddress,
        expiresAt,
      },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: userId,
        roles,
      }
    };
  }

  async refreshTokens(oldRefreshToken: string, userAgent?: string, ipAddress?: string) {
    const refreshTokenHash = crypto.createHash('sha256').update(oldRefreshToken).digest('hex');

    const session = await this.prisma.session.findFirst({
      where: { refreshTokenHash, isRevoked: false },
    });

    if (!session) {
      throw new UnauthorizedException(getErrorResponse(ErrorCode.AUTH_SESSION_REVOKED));
    }

    if (session.expiresAt < new Date()) {
      await this.prisma.session.update({
        where: { id: session.id },
        data: { isRevoked: true },
      });
      throw new UnauthorizedException(getErrorResponse(ErrorCode.AUTH_SESSION_EXPIRED));
    }

    // Revoke old session
    await this.prisma.session.update({
      where: { id: session.id },
      data: { isRevoked: true },
    });

    return this.generateTokens(session.userId, userAgent, ipAddress);
  }

  async logout(refreshToken: string) {
    const refreshTokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await this.prisma.session.updateMany({
      where: { refreshTokenHash },
      data: { isRevoked: true },
    });
  }
}
