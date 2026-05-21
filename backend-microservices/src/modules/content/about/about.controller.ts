import { Controller, Get, Post, Put, Delete, Body, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '../../../common/interceptors/fastify-file.interceptor';
import { AboutService } from './about.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('about')
export class AboutController {
  constructor(private readonly service: AboutService) {}

  @Public()
  @Get()
  async getAllContent() {
    return ApiResponse.success(await this.service.getAllContent());
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('about')
  @Post('cards')
  async createCard(@Body() body: Partial<any>) {
    return ApiResponse.success(await this.service.createCard(body), 'Card created');
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('about')
  @Put('cards/:id')
  async updateCard(@Param('id') id: string, @Body() body: Partial<any>) {
    return ApiResponse.success(await this.service.updateCard(id, body));
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('about')
  @Delete('cards/:id')
  async deleteCard(@Param('id') id: string) {
    await this.service.deleteCard(id);
    return ApiResponse.success(null, 'Card deleted');
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('about')
  @Post('stats')
  async createStat(@Body() body: Partial<any>) {
    return ApiResponse.success(await this.service.createStat(body), 'Stat created');
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('about')
  @Put('stats/:id')
  async updateStat(@Param('id') id: string, @Body() body: Partial<any>) {
    return ApiResponse.success(await this.service.updateStat(id, body));
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('about')
  @Delete('stats/:id')
  async deleteStat(@Param('id') id: string) {
    await this.service.deleteStat(id);
    return ApiResponse.success(null, 'Stat deleted');
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('about')
  @Post('timeline')
  async createTimeline(@Body() body: Partial<any>) {
    return ApiResponse.success(await this.service.createTimeline(body), 'Timeline event created');
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('about')
  @Put('timeline/:id')
  async updateTimeline(@Param('id') id: string, @Body() body: Partial<any>) {
    return ApiResponse.success(await this.service.updateTimeline(id, body));
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('about')
  @Delete('timeline/:id')
  async deleteTimeline(@Param('id') id: string) {
    await this.service.deleteTimeline(id);
    return ApiResponse.success(null, 'Timeline event deleted');
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('about')
  @Post('team')
  @UseInterceptors(FileInterceptor('image'))
  async createTeamMember(@Body() body: Partial<any>, @UploadedFile() image?: { path: string }) {
    const data = image ? { ...body, imageUrl: image.path } : body;
    return ApiResponse.success(await this.service.createTeamMember(data), 'Team member created');
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('about')
  @Put('team/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateTeamMember(@Param('id') id: string, @Body() body: Partial<any>, @UploadedFile() image?: { path: string }) {
    const data = image ? { ...body, imageUrl: image.path } : body;
    return ApiResponse.success(await this.service.updateTeamMember(id, data));
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('about')
  @Delete('team/:id')
  async deleteTeamMember(@Param('id') id: string) {
    await this.service.deleteTeamMember(id);
    return ApiResponse.success(null, 'Team member deleted');
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('about')
  @Post('goals')
  async createGoal(@Body() body: Partial<any>) {
    return ApiResponse.success(await this.service.createGoal(body), 'Goal created');
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('about')
  @Put('goals/:id')
  async updateGoal(@Param('id') id: string, @Body() body: Partial<any>) {
    return ApiResponse.success(await this.service.updateGoal(id, body));
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('about')
  @Delete('goals/:id')
  async deleteGoal(@Param('id') id: string) {
    await this.service.deleteGoal(id);
    return ApiResponse.success(null, 'Goal deleted');
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('about')
  @Put('settings')
  async updateSettings(@Body() body: Partial<any>) {
    return ApiResponse.success(await this.service.updateSettings(body), 'Settings updated');
  }
}
