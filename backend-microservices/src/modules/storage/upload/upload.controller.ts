import { Controller, Get, Post, Delete, UseInterceptors, UploadedFile, Param, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { UploadService } from './upload.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('upload')
export class UploadController {
  constructor(private service: UploadService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (_req: Express.Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) =>
          cb(null, `${uuidv4()}${extname(file.originalname)}`),
      }),
    }),
  )
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
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