import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment) private commentRepo: Repository<Comment>,
  ) {}

  async create(productId: string, userId: string, content: string, parentId?: string) {
    let depth = 0;
    if (parentId) {
      const parent = await this.commentRepo.findOne({ where: { id: parentId } });
      if (parent) depth = parent.depth + 1;
    }
    return this.commentRepo.save(this.commentRepo.create({ productId, userId, content, parentId, depth }));
  }

  async getByProduct(productId: string, approvedOnly = true) {
    const where: any = { productId };
    if (approvedOnly) where.isApproved = true;
    return this.commentRepo.find({ where, order: { createdAt: 'DESC' } });
  }

  async approve(id: string) {
    await this.commentRepo.update(id, { isApproved: true });
    return this.commentRepo.findOne({ where: { id } });
  }

  async hide(id: string) {
    await this.commentRepo.update(id, { isHidden: true });
    return this.commentRepo.findOne({ where: { id } });
  }

  async delete(id: string) {
    return this.commentRepo.delete(id);
  }
}