import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review) private reviewRepo: Repository<Review>,
  ) {}

  async create(productId: string, userId: string, rating: number, title?: string, comment?: string) {
    const existing = await this.reviewRepo.findOne({ where: { productId, userId } });
    if (existing) {
      await this.reviewRepo.update(existing.id, { rating, title, comment });
      return this.reviewRepo.findOne({ where: { id: existing.id } });
    }
    return this.reviewRepo.save(this.reviewRepo.create({ productId, userId, rating, title, comment }));
  }

  async getByProduct(productId: string, approvedOnly = true) {
    const where: any = { productId };
    if (approvedOnly) where.isApproved = true;
    return this.reviewRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async getAverageRating(productId: string) {
    const result = await this.reviewRepo
      .createQueryBuilder('review')
      .where('review.product_id = :productId', { productId })
      .andWhere('review.is_approved = true')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(*)', 'count')
      .getRawOne();
    return { average: parseFloat(result?.average || '0'), count: parseInt(result?.count || '0') };
  }

  async approve(id: string) {
    await this.reviewRepo.update(id, { isApproved: true });
    return this.reviewRepo.findOne({ where: { id } });
  }

  async markHelpful(id: string) {
    await this.reviewRepo.increment({ id }, 'helpfulCount', 1);
    return this.reviewRepo.findOne({ where: { id } });
  }

  async markNotHelpful(id: string) {
    await this.reviewRepo.increment({ id }, 'notHelpfulCount', 1);
    return this.reviewRepo.findOne({ where: { id } });
  }

  async delete(id: string) {
    return this.reviewRepo.delete(id);
  }
}