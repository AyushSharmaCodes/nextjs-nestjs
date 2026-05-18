import { Controller, Post, Get, Body, Req, Res, HttpCode, HttpStatus, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, VerifyOtpDto } from './dto/auth.dto';
import { Request, Response } from 'express';
import { ApiResponse } from '../../common/utils/api-response';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return ApiResponse.success(result, result.message);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginDto) {
    const result = await this.authService.login(dto);
    return ApiResponse.success(result, result.message);
  }

  @Post('verify-otp/registration')
  @HttpCode(HttpStatus.OK)
  async verifyRegistrationOtp(@Body() dto: VerifyOtpDto) {
    const result = (await this.authService.verifyOtp(dto, 'EMAIL_VERIFICATION')) as { message: string };
    return ApiResponse.success(null, result.message);
  }

  @Post('verify-otp/login')
  @HttpCode(HttpStatus.OK)
  async verifyLoginOtp(
    @Body() dto: VerifyOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    const result = (await this.authService.verifyOtp(dto, 'LOGIN', userAgent, ipAddress)) as {
      accessToken: string;
      refreshToken: string;
      user: { id: string; roles: string[] };
    };
    
    // Set HTTP-Only cookies
    this.setCookies(res, result.accessToken, result.refreshToken);

    return ApiResponse.success({ user: result.user }, 'Login successful');
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    
    if (!refreshToken) {
      throw new UnauthorizedException('No refresh token provided');
    }

    const userAgent = req.headers['user-agent'];
    const ipAddress = req.ip;

    const result = await this.authService.refreshTokens(refreshToken, userAgent, ipAddress);
    
    this.setCookies(res, result.accessToken, result.refreshToken);

    return ApiResponse.success({ user: result.user }, 'Tokens refreshed');
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies['refresh_token'];
    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return ApiResponse.success(null, 'Logged out successfully');
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async getMe(@Req() req: any) {
    // req.user is populated by JwtAuthGuard
    return ApiResponse.success({ user: req.user });
  }

  private setCookies(res: Response, accessToken: string, refreshToken: string) {
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
