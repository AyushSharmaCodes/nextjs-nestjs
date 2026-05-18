import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';

@Injectable()
export class CategoryRepository {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async findAll(type?: string) {
    const where = type ? { type, isActive: true } : { isActive: true };
    return this.categoryRepo.find({
      where,
      order: { displayOrder: 'ASC', name: 'ASC' },
      relations: ['children'],
    });
  }

  async findById(id: string) {
    return this.categoryRepo.findOne({
      where: { id },
      relations: ['children', 'parent'],
    });
  }

  async findBySlug(slug: string) {
    return this.categoryRepo.findOne({
      where: { slug },
      relations: ['children', 'parent'],
    });
  }

  async create(data: Partial<Category>) {
    const category = this.categoryRepo.create({
      ...data,
      slug: data.slug || this.generateSlug(data.name ?? ''),
    });
    return this.categoryRepo.save(category);
  }

  async update(id: string, data: Partial<Category>) {
    await this.categoryRepo.update(id, data);
    return this.findById(id);
  }

  async delete(id: string) {
    await this.categoryRepo.update(id, { isActive: false });
  }

  private generateSlug(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 150);
  }
}