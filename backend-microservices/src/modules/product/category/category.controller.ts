import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryRepository } from './category.repository';
import { ApiResponse } from '../../../common/utils/api-response';
import { Category } from './entities/category.entity';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('categories')
export class CategoryController {
  constructor(
    private readonly categoryService: CategoryService,
    private readonly categoryRepo: CategoryRepository,
  ) {}

  @Public()
  @Get()
  async getCategories(@Query('type') type?: string) {
    const categories = await this.categoryRepo.findAll(type);
    return ApiResponse.success(categories);
  }

  @Public()
  @Get(':id')
  async getCategory(@Param('id') id: string) {
    const category = await this.categoryRepo.findById(id);
    return ApiResponse.success(category);
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('products')
  @Post()
  async createCategory(@Body() data: Partial<Category>) {
    const category = await this.categoryRepo.create(data);
    return ApiResponse.success(category, 'Category created');
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('products')
  @Put(':id')
  async updateCategory(@Param('id') id: string, @Body() data: Partial<Category>) {
    const category = await this.categoryRepo.update(id, data);
    return ApiResponse.success(category, 'Category updated');
  }

  @Roles('ADMIN', 'MANAGER')
  @Permissions('products')
  @Delete(':id')
  async deleteCategory(@Param('id') id: string) {
    await this.categoryRepo.delete(id);
    return ApiResponse.success(null, 'Category deleted');
  }
}
