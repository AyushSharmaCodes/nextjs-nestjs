import { Controller, Get, Post, Put, Delete, Body, Param, Query, Headers } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('reviews')
export class ReviewController {
  constructor(private readonly service: ReviewService) {}

  @Get('product/:productId')
  async getByProduct(
    @Param('productId') productId: string,
    @Query('approved') approved = 'true',
  ) {
    return ApiResponse.success(await this.service.getByProduct(productId, approved !== 'false'));
  }

  @Get('product/:productId/stats')
  async getStats(@Param('productId') productId: string) {
    return ApiResponse.success(await this.service.getAverageRating(productId));
  }

  @Post()
  async create(
    @Body() body: { productId: string; rating: number; title?: string; comment?: string },
    @Headers('x-user-id') userId: string,
  ) {
    return ApiResponse.success(await this.service.create(body.productId, userId, body.rating, body.title, body.comment), 'Review created');
  }

  @Put(':id/approve')
  async approve(@Param('id') id: string) {
    return ApiResponse.success(await this.service.approve(id), 'Review approved');
  }

  @Put(':id/helpful')
  async markHelpful(@Param('id') id: string) {
    return ApiResponse.success(await this.service.markHelpful(id), 'Marked helpful');
  }

  @Put(':id/not-helpful')
  async markNotHelpful(@Param('id') id: string) {
    return ApiResponse.success(await this.service.markNotHelpful(id), 'Marked not helpful');
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.service.delete(id);
    return ApiResponse.success(null, 'Review deleted');
  }
}