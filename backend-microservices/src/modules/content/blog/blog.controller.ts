import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { BlogService } from './blog.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('blogs')
export class BlogController {
  constructor(private service: BlogService) {}
  @Public()
  @Get() getAll(@Query('page') p=1, @Query('limit') l=10) { return ApiResponse.success(this.service.getBlogs(p, l)); }
  @Public()
  @Get('featured') getFeatured() { return ApiResponse.success(this.service.getFeatured()); }
  @Public()
  @Get(':slug') getBySlug(@Param('slug') s: string) { return ApiResponse.success(this.service.getBySlug(s)); }
  @Roles('ADMIN', 'MANAGER')
  @Permissions('blogs')
  @Post() create(@Body() b: any) { return ApiResponse.success(this.service.create(b), 'Created'); } // ts-audit-ignore
  @Roles('ADMIN', 'MANAGER')
  @Permissions('blogs')
  @Put(':id') update(@Param('id') i: string, @Body() b: any) { return ApiResponse.success(this.service.update(i, b)); } // ts-audit-ignore
  @Roles('ADMIN', 'MANAGER')
  @Permissions('blogs')
  @Delete(':id') delete(@Param('id') i: string) { return ApiResponse.success(this.service.delete(i)); }
}
