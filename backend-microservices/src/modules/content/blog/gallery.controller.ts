import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { GalleryService } from './gallery.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('gallery')
export class GalleryController {
  constructor(private service: GalleryService) {}

  @Public()
  @Get() getAll() { return ApiResponse.success(this.service.getAll()); }
  @Roles('ADMIN', 'MANAGER')
  @Permissions('gallery')
  @Post() create(@Body() b: any) { return ApiResponse.success(this.service.create(b), 'Created'); } // ts-audit-ignore

  // Folders
  @Public()
  @Get('folders') getFolders() { return ApiResponse.success(this.service.getFolders()); }
  @Public()
  @Get('folders/:id') getFolder(@Param('id') id: string) { return ApiResponse.success(this.service.getFolderById(id)); }
  @Roles('ADMIN', 'MANAGER')
  @Permissions('gallery')
  @Post('folders') createFolder(@Body() b: any) { return ApiResponse.success(this.service.createFolder(b), 'Folder created'); } // ts-audit-ignore
  @Roles('ADMIN', 'MANAGER')
  @Permissions('gallery')
  @Put('folders/:id') updateFolder(@Param('id') id: string, @Body() b: any) { return ApiResponse.success(this.service.updateFolder(id, b)); } // ts-audit-ignore
  @Roles('ADMIN', 'MANAGER')
  @Permissions('gallery')
  @Delete('folders/:id') deleteFolder(@Param('id') id: string) { return ApiResponse.success(this.service.deleteFolder(id), 'Folder deleted'); }

  // Items
  @Public()
  @Get('items') getItems(@Query('folderId') folderId?: string) { return ApiResponse.success(this.service.getItems(folderId)); }
  @Roles('ADMIN', 'MANAGER')
  @Permissions('gallery')
  @Post('items') createItem(@Body() b: any) { return ApiResponse.success(this.service.createItem(b), 'Item created'); } // ts-audit-ignore
  @Roles('ADMIN', 'MANAGER')
  @Permissions('gallery')
  @Put('items/:id') updateItem(@Param('id') id: string, @Body() b: any) { return ApiResponse.success(this.service.updateItem(id, b)); } // ts-audit-ignore
  @Roles('ADMIN', 'MANAGER')
  @Permissions('gallery')
  @Delete('items/:id') deleteItem(@Param('id') id: string) { return ApiResponse.success(this.service.deleteItem(id), 'Item deleted'); }

  // Videos
  @Public()
  @Get('videos') getVideos(@Query('folderId') folderId?: string) { return ApiResponse.success(this.service.getVideos(folderId)); }
  @Roles('ADMIN', 'MANAGER')
  @Permissions('gallery')
  @Post('videos') createVideo(@Body() b: any) { return ApiResponse.success(this.service.createVideo(b), 'Video created'); } // ts-audit-ignore
  @Roles('ADMIN', 'MANAGER')
  @Permissions('gallery')
  @Put('videos/:id') updateVideo(@Param('id') id: string, @Body() b: any) { return ApiResponse.success(this.service.updateVideo(id, b)); } // ts-audit-ignore
  @Roles('ADMIN', 'MANAGER')
  @Permissions('gallery')
  @Delete('videos/:id') deleteVideo(@Param('id') id: string) { return ApiResponse.success(this.service.deleteVideo(id), 'Video deleted'); }
}
