import { Controller, Post, Body, Get, Headers, Ip, Req } from '@nestjs/common';
import { IdentityService } from './identity.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('auth')
export class IdentityController {
  constructor(private readonly identityService: IdentityService) {}

  @Post('register')
  async register(
    @Body() body: { email: string; password?: string; name?: string; role?: string; otpVerified?: boolean },
  ) {
    const user = await this.identityService.register({
      email: body.email,
      password: body.password,
      name: body.name,
      role: body.role,
      isEmailVerified: body.otpVerified,
    });
    return ApiResponse.success({ user }, 'Registration successful');
  }

  @Post('email/check')
  async checkEmail(@Body() body: { email: string }) {
    const exists = await this.identityService.checkEmailExists(body.email);
    if (exists) {
      return ApiResponse.success(null, 'Email already registered');
    }
    return ApiResponse.success({ available: true }, 'Email is available');
  }

  @Post('validate-credentials')
  async validateCredentials(
    @Body() body: { email: string; password: string },
    @Req() req: Request,
  ) {
    const result = await this.identityService.verifyCredentials(body.email, body.password);
    if (!result.success) {
      return ApiResponse.error(result.error || 'Invalid credentials', 'CREDENTIALS_VALIDATION_FAILED');
    }
    return ApiResponse.success({ valid: true, identityId: result.identityId });
  }

  @Post('password/reset/request')
  async resetPasswordRequest(@Body() body: { email: string }) {
    const result = await this.identityService.requestPasswordReset(body.email);
    return ApiResponse.success(result, 'If the account exists, password reset instructions have been sent');
  }

  @Get('password/reset/validate')
  async validateResetToken(@Body() body: { token: string }) {
    const valid = await this.identityService.validateResetToken(body.token);
    return ApiResponse.success({ valid });
  }

  @Post('password/reset')
  async resetPassword(@Body() body: { token: string; newPassword: string }) {
    await this.identityService.resetPassword(body.token, body.newPassword);
    return ApiResponse.success(null, 'Password reset successful');
  }

  @Post('password/change')
  async changePassword(
    @Body() body: { currentPassword: string; newPassword: string },
    @Headers('x-user-id') userId: string,
  ) {
    await this.identityService.changePassword(userId, body.currentPassword, body.newPassword);
    return ApiResponse.success(null, 'Password changed successfully');
  }
}