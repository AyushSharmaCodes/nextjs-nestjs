import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { BlogService } from './blog.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('blogs')
export class BlogController {
  constructor(private service: BlogService) {}
  @Get() getAll(@Query('page') p=1, @Query('limit') l=10) { return ApiResponse.success(this.service.getBlogs(p, l)); }
  @Get('featured') getFeatured() { return ApiResponse.success(this.service.getFeatured()); }
  @Get(':slug') getBySlug(@Param('slug') s: string) { return ApiResponse.success(this.service.getBySlug(s)); }
  @Post() create(@Body() b: any) { return ApiResponse.success(this.service.create(b), 'Created'); }
  @Put(':id') update(@Param('id') i: string, @Body() b: any) { return ApiResponse.success(this.service.update(i, b)); }
  @Delete(':id') delete(@Param('id') i: string) { return ApiResponse.success(this.service.delete(i)); }
}