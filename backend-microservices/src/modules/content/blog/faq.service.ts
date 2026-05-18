import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Faq } from './entities/faq.entity';

@Injectable()
export class FaqService {
  constructor(@InjectRepository(Faq) private repo: Repository<Faq>) {}
  getAll() { return this.repo.find({ where: { isActive: true }, order: { displayOrder: 'ASC' } }); }
  create(b: any) { return this.repo.save(this.repo.create(b)); }
}