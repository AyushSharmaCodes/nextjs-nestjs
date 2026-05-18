import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import * as crypto from 'crypto';
import { TokenPayload } from '../../../../common/types';

@Injectable()
export class JwtService {
  private privateKey: string;
  private publicKey: string;
  private keyId: string;

  constructor(private readonly configService: ConfigService) {
    this.keyId = this.configService.get('JWT_KEY_ID', 'default-key-id');
    this.privateKey = this.configService.get('JWT_PRIVATE_KEY') || this.generateKeyPair().privateKey;
    this.publicKey = this.configService.get('JWT_PUBLIC_KEY') || this.generateKeyPair().publicKey;
  }

  private generateKeyPair() {
    const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: { type: 'spki', format: 'pem' },
      privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
    });
    return { privateKey, publicKey };
  }

  async generateAccessToken(payload: TokenPayload): Promise<string> {
    return jwt.sign(payload, this.privateKey, {
      algorithm: 'RS256',
      expiresIn: '1h',
      issuer: 'merigaumata-auth',
    });
  }

  verifyAccessToken(token: string): TokenPayload {
    try {
      return jwt.verify(token, this.publicKey, {
        algorithms: ['RS256'],
        issuer: 'merigaumata-auth',
      }) as TokenPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  getPublicKey(): { publicKey: string; keyId: string } {
    return {
      publicKey: this.publicKey,
      keyId: this.keyId,
    };
  }
}