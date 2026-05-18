import { Controller, Post, Body, Req, Res } from '@nestjs/common';
import { OAuthService } from './oauth.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('auth/google')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Post('authorize')
  async authorize() {
    const authRequest = this.oauthService.createAuthorizationRequest();
    return ApiResponse.success({ url: authRequest.url }, 'Authorization initialized');
  }

  @Post('exchange')
  async exchange(
    @Body() body: { code: string; state: string },
    @Req() req: Request,
    @Res() res: any,
  ) {
    const guestId = (req as any).headers['x-guest-id'];
    const expectedState = (req as any).cookies?.['google_oauth_state'];

    if (expectedState && expectedState !== body.state) {
      return ApiResponse.error('Invalid state', 'INVALID_SESSION');
    }

    const codeVerifier = (req as any).cookies?.['google_oauth_code_verifier'];
    const result = await this.oauthService.exchangeCode(body.code, codeVerifier, '');

    res.cookie('access_token', result.tokens.accessToken, { httpOnly: true, sameSite: 'strict' });
    res.cookie('refresh_token', result.tokens.refreshToken, { httpOnly: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

    return ApiResponse.success({ user: result.user }, 'Login successful');
  }
}