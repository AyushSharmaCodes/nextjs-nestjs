import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';
import { MailService } from '../../../infrastructure/mail/mail.service';
import * as crypto from 'crypto';
import { ErrorCode, getErrorResponse } from '../../../common/constants/error-codes';

@Injectable()
export class OtpService {
  private readonly otpExpiryMinutes = 10;
  private readonly otpResendCooldownSeconds = 30;

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  private generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digits
  }

  private hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  async createChallenge(userId: string, email: string, type: string) {
    const latestActiveChallenge = await this.prisma.oTPChallenge.findFirst({
      where: { userId, type, isVerified: false },
      orderBy: { createdAt: 'desc' },
    });

    if (latestActiveChallenge) {
      const earliestResendAt = new Date(latestActiveChallenge.createdAt.getTime() + this.otpResendCooldownSeconds * 1000);
      if (earliestResendAt > new Date()) {
        throw new BadRequestException(
          getErrorResponse(
            ErrorCode.BAD_REQUEST,
            `Please wait ${this.otpResendCooldownSeconds} seconds before requesting a new OTP.`,
          ),
        );
      }
    }

    const otp = this.generateOtp();
    const otpHash = this.hashOtp(otp);

    // Invalidate existing challenges for this user and type
    await this.prisma.oTPChallenge.deleteMany({
      where: { userId, type },
    });

    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.otpExpiryMinutes);

    await this.prisma.oTPChallenge.create({
      data: {
        userId,
        otpHash,
        type,
        expiresAt,
      },
    });

    // Send email
    await this.mailService.sendMail({
      to: email,
      subject: `Your ${type === 'LOGIN' ? 'Login' : 'Verification'} OTP Code`,
      html: `<p>Your code is: <strong>${otp}</strong></p><p>It will expire in ${this.otpExpiryMinutes} minutes.</p>`,
      text: `Your code is: ${otp}. It will expire in ${this.otpExpiryMinutes} minutes.`,
    });

    return true;
  }

  async verifyChallenge(userId: string, otp: string, type: string) {
    const otpHash = this.hashOtp(otp);

    const challenge = await this.prisma.oTPChallenge.findFirst({
      where: { userId, type, isVerified: false },
      orderBy: { createdAt: 'desc' },
    });

    if (!challenge) {
      throw new BadRequestException(getErrorResponse(ErrorCode.OTP_NOT_FOUND));
    }

    if (challenge.attempts >= 3) {
      throw new BadRequestException(getErrorResponse(ErrorCode.OTP_MAX_ATTEMPTS_EXCEEDED));
    }

    if (challenge.expiresAt < new Date()) {
      throw new BadRequestException(getErrorResponse(ErrorCode.OTP_EXPIRED));
    }

    if (challenge.otpHash !== otpHash) {
      await this.prisma.oTPChallenge.update({
        where: { id: challenge.id },
        data: { attempts: { increment: 1 } },
      });
      throw new BadRequestException(getErrorResponse(ErrorCode.OTP_INVALID));
    }

    await this.prisma.oTPChallenge.update({
      where: { id: challenge.id },
      data: { isVerified: true },
    });

    return true;
  }
}
