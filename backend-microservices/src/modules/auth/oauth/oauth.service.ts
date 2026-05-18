import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuthRepository } from './oauth.repository';
import { IdentityRepository } from '../identity/identity.repository';
import { SessionService } from '../session/session.service';
import { SessionMetadata } from '../session/dto/session.dto';
import { v4 as uuidv4 } from 'uuid';

interface GoogleAuthorizationRequest {
  state: string;
  nonce: string;
  codeVerifier: string;
  url: string;
}

interface GoogleProfile {
  id: string;
  email: string;
  name?: string;
  picture?: string;
}

@Injectable()
export class OAuthService {
  private readonly googleClientId: string;
  private readonly googleClientSecret: string;
  private readonly redirectUri: string;

  constructor(
    private readonly oauthRepo: OAuthRepository,
    private readonly identityRepo: IdentityRepository,
    private readonly sessionService: SessionService,
    private readonly configService: ConfigService,
  ) {
    this.googleClientId = this.configService.get('GOOGLE_CLIENT_ID', '');
    this.googleClientSecret = this.configService.get('GOOGLE_CLIENT_SECRET', '');
    this.redirectUri = this.configService.get('GOOGLE_REDIRECT_URI', 'http://localhost:3001/auth/google/callback');
  }

  createAuthorizationRequest(): GoogleAuthorizationRequest {
    const state = uuidv4();
    const nonce = uuidv4();
    const codeVerifier = uuidv4();
    const codeChallenge = Buffer.from(codeVerifier).toString('base64url');

    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.searchParams.set('client_id', this.googleClientId);
    url.searchParams.set('redirect_uri', this.redirectUri);
    url.searchParams.set('response_type', 'code');
    url.searchParams.set('scope', 'openid email profile');
    url.searchParams.set('state', state);
    url.searchParams.set('nonce', nonce);
    url.searchParams.set('code_challenge', codeChallenge);
    url.searchParams.set('code_challenge_method', 'S256');

    return { state, nonce, codeVerifier, url: url.toString() };
  }

  async exchangeCode(code: string, codeVerifier: string, expectedNonce: string): Promise<{ user?: any; tokens: any }> {
    const tokenResponse = await this.fetchToken(code, codeVerifier);
    const googleProfile = await this.fetchUserInfo(tokenResponse.access_token);

    let oauthIdentity = await this.oauthRepo.findByProviderAndProviderUserId('google', googleProfile.id);

    if (!oauthIdentity) {
      const exists = await this.identityRepo.emailExists(googleProfile.email);
      if (exists) {
        const existingIdentity = await this.identityRepo.findByEmail(googleProfile.email);
        oauthIdentity = await this.oauthRepo.create({
          identityId: existingIdentity?.id ?? '',
          provider: 'google',
          providerUserId: googleProfile.id,
          providerEmail: googleProfile.email,
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          tokenExpiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
        });
      } else {
        const identity = await this.identityRepo.create({
          email: googleProfile.email,
          role: 'customer',
          authProvider: 'google',
          emailVerified: true,
        });

        oauthIdentity = await this.oauthRepo.create({
          identityId: identity.id,
          provider: 'google',
          providerUserId: googleProfile.id,
          providerEmail: googleProfile.email,
          accessToken: tokenResponse.access_token,
          refreshToken: tokenResponse.refresh_token,
          tokenExpiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
        });
      }
    } else {
      await this.oauthRepo.update(oauthIdentity.id, {
        accessToken: tokenResponse.access_token,
        refreshToken: tokenResponse.refresh_token,
        tokenExpiresAt: new Date(Date.now() + tokenResponse.expires_in * 1000),
      });
    }

    const tokens = await this.sessionService.createSession(oauthIdentity.identityId);
    const identity = await this.identityRepo.findById(oauthIdentity.identityId);
    if (identity) {
      await this.identityRepo.incrementLoginCount(identity.id);
      await this.identityRepo.updateLastLogin(identity.id);
      return {
        user: { id: identity.id, email: identity.email, role: identity.role },
        tokens,
      };
    }
    return { tokens };
  }

  private async fetchToken(code: string, codeVerifier: string): Promise<any> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: this.googleClientId,
        client_secret: this.googleClientSecret,
        code,
        code_verifier: codeVerifier,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      }),
    });
    return response.json();
  }

  private async fetchUserInfo(accessToken: string): Promise<GoogleProfile> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    return response.json();
  }
}