import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('gallery')
export class GalleryController {
  constructor(private service: GalleryService) {}

  @Get() getAll() { return ApiResponse.success(this.service.getAll()); }
  @Post() create(@Body() b: any) { return ApiResponse.success(this.service.create(b), 'Created'); }

  // Folders
  @Get('folders') getFolders() { return ApiResponse.success(this.service.getFolders()); }
  @Get('folders/:id') getFolder(@Param('id') id: string) { return ApiResponse.success(this.service.getFolderById(id)); }
  @Post('folders') createFolder(@Body() b: any) { return ApiResponse.success(this.service.createFolder(b), 'Folder created'); }
  @Put('folders/:id') updateFolder(@Param('id') id: string, @Body() b: any) { return ApiResponse.success(this.service.updateFolder(id, b)); }
  @Delete('folders/:id') deleteFolder(@Param('id') id: string) { return ApiResponse.success(this.service.deleteFolder(id), 'Folder deleted'); }

  // Items
  @Get('items') getItems(@Query('folderId') folderId?: string) { return ApiResponse.success(this.service.getItems(folderId)); }
  @Post('items') createItem(@Body() b: any) { return ApiResponse.success(this.service.createItem(b), 'Item created'); }
  @Put('items/:id') updateItem(@Param('id') id: string, @Body() b: any) { return ApiResponse.success(this.service.updateItem(id, b)); }
  @Delete('items/:id') deleteItem(@Param('id') id: string) { return ApiResponse.success(this.service.deleteItem(id), 'Item deleted'); }

  // Videos
  @Get('videos') getVideos(@Query('folderId') folderId?: string) { return ApiResponse.success(this.service.getVideos(folderId)); }
  @Post('videos') createVideo(@Body() b: any) { return ApiResponse.success(this.service.createVideo(b), 'Video created'); }
  @Put('videos/:id') updateVideo(@Param('id') id: string, @Body() b: any) { return ApiResponse.success(this.service.updateVideo(id, b)); }
  @Delete('videos/:id') deleteVideo(@Param('id') id: string) { return ApiResponse.success(this.service.deleteVideo(id), 'Video deleted'); }
}