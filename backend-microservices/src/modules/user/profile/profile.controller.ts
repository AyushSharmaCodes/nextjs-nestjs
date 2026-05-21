import { Controller, Get, Put, Body } from '@nestjs/common';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ProfileService } from './profile.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('profile')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  async getProfile(@CurrentUser() user: { id: string }) {
    return ApiResponse.success(await this.profileService.getProfile(user.id));
  }

  @Put()
  async updateProfile(@CurrentUser() user: { id: string }, @Body() data: any) {
    return ApiResponse.success(await this.profileService.updateProfile(user.id, data), 'Profile updated');
  }
}
