import { Controller, Get, Post, Put, Delete, Body, Param, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AboutService } from './about.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('about')
export class AboutController {
  constructor(private readonly service: AboutService) {}

  @Get()
  async getAllContent() {
    return ApiResponse.success(await this.service.getAllContent());
  }

  @Post('cards')
  async createCard(@Body() body: Partial<any>) {
    return ApiResponse.success(await this.service.createCard(body), 'Card created');
  }

  @Put('cards/:id')
  async updateCard(@Param('id') id: string, @Body() body: Partial<any>) {
    return ApiResponse.success(await this.service.updateCard(id, body));
  }

  @Delete('cards/:id')
  async deleteCard(@Param('id') id: string) {
    await this.service.deleteCard(id);
    return ApiResponse.success(null, 'Card deleted');
  }

  @Post('stats')
  async createStat(@Body() body: Partial<any>) {
    return ApiResponse.success(await this.service.createStat(body), 'Stat created');
  }

  @Put('stats/:id')
  async updateStat(@Param('id') id: string, @Body() body: Partial<any>) {
    return ApiResponse.success(await this.service.updateStat(id, body));
  }

  @Delete('stats/:id')
  async deleteStat(@Param('id') id: string) {
    await this.service.deleteStat(id);
    return ApiResponse.success(null, 'Stat deleted');
  }

  @Post('timeline')
  async createTimeline(@Body() body: Partial<any>) {
    return ApiResponse.success(await this.service.createTimeline(body), 'Timeline event created');
  }

  @Put('timeline/:id')
  async updateTimeline(@Param('id') id: string, @Body() body: Partial<any>) {
    return ApiResponse.success(await this.service.updateTimeline(id, body));
  }

  @Delete('timeline/:id')
  async deleteTimeline(@Param('id') id: string) {
    await this.service.deleteTimeline(id);
    return ApiResponse.success(null, 'Timeline event deleted');
  }

  @Post('team')
  @UseInterceptors(FileInterceptor('image'))
  async createTeamMember(@Body() body: Partial<any>, @UploadedFile() image?: Express.Multer.File) {
    const data = image ? { ...body, imageUrl: (image as Express.Multer.File).path } : body;
    return ApiResponse.success(await this.service.createTeamMember(data), 'Team member created');
  }

  @Put('team/:id')
  @UseInterceptors(FileInterceptor('image'))
  async updateTeamMember(@Param('id') id: string, @Body() body: Partial<any>, @UploadedFile() image?: Express.Multer.File) {
    const data = image ? { ...body, imageUrl: (image as Express.Multer.File).path } : body;
    return ApiResponse.success(await this.service.updateTeamMember(id, data));
  }

  @Delete('team/:id')
  async deleteTeamMember(@Param('id') id: string) {
    await this.service.deleteTeamMember(id);
    return ApiResponse.success(null, 'Team member deleted');
  }

  @Post('goals')
  async createGoal(@Body() body: Partial<any>) {
    return ApiResponse.success(await this.service.createGoal(body), 'Goal created');
  }

  @Put('goals/:id')
  async updateGoal(@Param('id') id: string, @Body() body: Partial<any>) {
    return ApiResponse.success(await this.service.updateGoal(id, body));
  }

  @Delete('goals/:id')
  async deleteGoal(@Param('id') id: string) {
    await this.service.deleteGoal(id);
    return ApiResponse.success(null, 'Goal deleted');
  }

  @Put('settings')
  async updateSettings(@Body() body: Partial<any>) {
    return ApiResponse.success(await this.service.updateSettings(body), 'Settings updated');
  }
}