import { IsString, IsOptional, IsObject } from 'class-validator';

export class TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface SessionMetadata {
  ipAddress?: string;
  userAgent?: string;
  deviceInfo?: {
    userAgent?: string;
    deviceName?: string;
    platform?: string;
    browser?: string;
  };
}