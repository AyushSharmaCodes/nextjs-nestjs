import { Controller, Post, Get, Delete, Body, Headers, Req } from '@nestjs/common';
import { SessionService } from './session.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('auth/sessions')
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Post('refresh')
  async refresh(
    @Body() body: { refreshToken?: string },
    @Headers('cookie') cookie?: string,
  ) {
    const refreshToken = body.refreshToken || this.extractRefreshToken(cookie);
    if (!refreshToken) {
      return ApiResponse.error('Refresh token required', 'MISSING_REFRESH_TOKEN');
    }

    const tokens = await this.sessionService.refreshTokens(refreshToken);
    return ApiResponse.success(tokens, 'Token refreshed');
  }

  @Post('logout')
  async logout(
    @Headers('cookie') cookie?: string,
    @Body() body?: { refreshToken?: string },
  ) {
    const refreshToken = body?.refreshToken || this.extractRefreshToken(cookie);
    await this.sessionService.logout(undefined, refreshToken ?? undefined);
    return ApiResponse.success(null, 'Logged out successfully');
  }

  @Get('current')
  async getCurrentSession(@Headers('x-session-id') sessionId: string) {
    const session = await this.sessionService.getCurrentSession(sessionId);
    return ApiResponse.success({ session });
  }

  @Get()
  async getSessions(@Headers('x-user-id') userId: string) {
    const sessions = await this.sessionService.getUserSessions(userId);
    return ApiResponse.success({ sessions });
  }

  @Delete(':id')
  async revokeSession(@Headers('x-user-id') userId: string, @Body() body: { sessionId: string }) {
    await this.sessionService.revokeSession(body.sessionId);
    return ApiResponse.success(null, 'Session revoked');
  }

  @Delete()
  async revokeAllSessions(@Headers('x-user-id') userId: string) {
    await this.sessionService.revokeAllSessions(userId);
    return ApiResponse.success(null, 'All sessions revoked');
  }

  private extractRefreshToken(cookie?: string): string | null {
    if (!cookie) return null;
    const match = cookie.match(/refresh_token=([^;]+)/);
    return match ? match[1] : null;
  }
}