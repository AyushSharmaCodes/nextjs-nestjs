import { Controller, Get, Put, Body, Headers } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@Headers('x-user-id') identityId: string) {
    return ApiResponse.success(await this.profileService.getProfile(identityId));
  }

  @Put()
  async updateProfile(@Headers('x-user-id') identityId: string, @Body() data: any) {
    return ApiResponse.success(await this.profileService.updateProfile(identityId, data), 'Profile updated');
  }
}