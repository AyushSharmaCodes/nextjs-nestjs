import { Controller, Get, Post, Delete, UseInterceptors, UploadedFile, Param, Query } from '@nestjs/common';
import { FileInterceptor } from '../../../common/interceptors/fastify-file.interceptor';
import { UploadService } from './upload.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('upload')
export class UploadController {
  constructor(private service: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', { destination: './uploads' }))
  async uploadImage(@UploadedFile() file: { filename: string }) {
    return ApiResponse.success({ url: `/uploads/${file.filename}`, filename: file.filename }, 'Uploaded');
  }

  @Get()
  getAll(@Query('userId') userId?: string) {
    return ApiResponse.success(this.service.getFiles(userId));
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return ApiResponse.success(this.service.delete(id));
  }
}