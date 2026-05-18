import { Injectable, NotFoundException } from '@nestjs/common';
import { CategoryRepository } from './category.repository';

@Injectable()
export class CategoryService {
  constructor(private readonly categoryRepo: CategoryRepository) {}

  async getCategories(type?: string) {
    return this.categoryRepo.findAll(type);
  }

  async getCategoryById(id: string) {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async createCategory(data: any) {
    return this.categoryRepo.create(data);
  }

  async updateCategory(id: string, data: any) {
    const category = await this.categoryRepo.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    return this.categoryRepo.update(id, data);
  }

  async deleteCategory(id: string) {
    await this.categoryRepo.delete(id);
  }
}