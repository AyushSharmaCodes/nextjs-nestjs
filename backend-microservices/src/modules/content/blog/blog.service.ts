import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';

@Injectable()
export class BlogService {
  constructor(@InjectRepository(Blog) private repo: Repository<Blog>) {}
  getBlogs(p=1, l=10) { return this.repo.find({ where: { isActive: true }, order: { createdAt: 'DESC' }, skip: (p-1)*l, take: l }); }
  getFeatured() { return this.repo.find({ where: { isFeatured: true, isActive: true }, order: { createdAt: 'DESC' }, take: 4 }); }
  getBySlug(s: string) { return this.repo.findOne({ where: { slug: s, isActive: true } }); }
  create(b: any) { return this.repo.save(this.repo.create(b)); } // ts-audit-ignore
  update(i: string, b: any) { return this.repo.update(i, b).then(() => this.repo.findOne({ where: { id: i } })); } // ts-audit-ignore
  delete(i: string) { return this.repo.update(i, { isActive: false }); }
}