import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../../infrastructure/database/prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    // Attempt to load public key for RS256 validation. 
    // Fallback to symmetric HS256 secret for local dev if keys not provided
    const publicKey = configService.get<string>('JWT_PUBLIC_KEY');
    const secretKey = configService.get<string>('JWT_SECRET');

    if (!publicKey || !secretKey) {
      throw new Error('JWT_PUBLIC_KEY and JWT_SECRET must both be configured');
    }

    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = null;
          if (request && request.cookies) {
            token = request.cookies['access_token'];
          }
          if (!token && request.headers.authorization) {
            const authHeader = request.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
              token = authHeader.split(' ')[1];
            }
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: Buffer.from(publicKey, 'base64').toString('ascii'),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: { sub: string; roles: string[] }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
    });

    if (!user || user.isBlocked || user.isDeleted) {
      throw new UnauthorizedException('User account is invalid or deactivated');
    }

    return {
      id: user.id,
      email: user.email,
      roles: payload.roles,
    };
  }
}
