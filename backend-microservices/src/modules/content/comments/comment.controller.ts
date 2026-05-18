import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { CommentService } from './comment.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('comments')
export class CommentController {
  constructor(private readonly service: CommentService) {}

  @Get('product/:productId')
  async getByProduct(
    @Param('productId') productId: string,
    @Query('approved') approved = 'true',
  ) {
    return ApiResponse.success(await this.service.getByProduct(productId, approved !== 'false'));
  }

  @Post()
  async create(
    @Body() body: { productId: string; content: string; parentId?: string },
    @Headers('x-user-id') userId: string,
  ) {
    return ApiResponse.success(await this.service.create(body.productId, userId, body.content, body.parentId), 'Comment created');
  }

  @Put(':id/approve')
  async approve(@Param('id') id: string) {
    return ApiResponse.success(await this.service.approve(id), 'Comment approved');
  }

  @Put(':id/hide')
  async hide(@Param('id') id: string) {
    return ApiResponse.success(await this.service.hide(id), 'Comment hidden');
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return ApiResponse.success(null, 'Comment deleted');
  }
}