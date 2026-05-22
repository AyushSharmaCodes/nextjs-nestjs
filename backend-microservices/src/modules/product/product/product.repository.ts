import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { ProductVariant } from './entities/product-variant.entity';
import { CreateProductDto, UpdateProductDto, ProductQueryDto } from './dto/product.dto';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,
    @InjectRepository(ProductVariant)
    private readonly variantRepo: Repository<ProductVariant>,
  ) {}

  async findById(id: string): Promise<Product | null> {
    return this.productRepo.findOne({
      where: { id },
      relations: ['variants', 'category'],
    });
  }

  async findBySlug(slug: string): Promise<Product | null> {
    return this.productRepo.findOne({
      where: { slug },
      relations: ['variants', 'category'],
    });
  }

  async findFeatured(limit = 10): Promise<Product[]> {
    return this.productRepo.find({
      where: { isFeatured: true, isActive: true },
      relations: ['variants', 'category'],
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async findAll(query: ProductQueryDto) {
    const { page = 1, limit = 20, categoryId, search, minPrice, maxPrice, sortBy = 'createdAt', sortOrder = 'DESC' } = query;

    const qb = this.productRepo
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.variants', 'variant')
      .where('product.isActive = :isActive', { isActive: true });

    if (categoryId) {
      qb.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (search) {
      qb.andWhere(
        '(product.title ILIKE :search OR product.description ILIKE :search OR product.tags @> :searchJson)',
        { search: `%${search}%`, searchJson: JSON.stringify([search]) },
      );
    }

    if (minPrice) {
      qb.andWhere('product.sellingPrice >= :minPrice', { minPrice });
    }

    if (maxPrice) {
      qb.andWhere('product.sellingPrice <= :maxPrice', { maxPrice });
    }

    const total = await qb.getCount();
    const products = await qb
      .orderBy(`product.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { products, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async create(data: CreateProductDto): Promise<Product> {
    const product = this.productRepo.create({
      ...data,
      slug: this.generateSlug(data.title),
    });
    return this.productRepo.save(product);
  }

  async update(id: string, data: UpdateProductDto): Promise<Product> {
    await this.productRepo.update(id, data);
    return this.findById(id) as Promise<Product>;
  }

  async delete(id: string): Promise<void> {
    await this.productRepo.update(id, { isActive: false });
  }

  async createVariant(productId: string, data: Partial<ProductVariant>): Promise<ProductVariant> {
    const variant = this.variantRepo.create({ ...data, productId });
    return this.variantRepo.save(variant);
  }

  async updateVariant(id: string, data: Partial<ProductVariant>): Promise<ProductVariant> {
    await this.variantRepo.update(id, data);
    return this.variantRepo.findOne({ where: { id } }) as Promise<ProductVariant>;
  }

  async deleteVariant(id: string): Promise<void> {
    await this.variantRepo.update(id, { isActive: false });
  }

  async findVariantById(id: string): Promise<ProductVariant | null> {
    return this.variantRepo.findOne({ where: { id }, relations: ['product'] });
  }

  async findVariantsByProductId(productId: string): Promise<ProductVariant[]> {
    return this.variantRepo.find({ where: { productId, isActive: true } });
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
      .slice(0, 300);
  }
}