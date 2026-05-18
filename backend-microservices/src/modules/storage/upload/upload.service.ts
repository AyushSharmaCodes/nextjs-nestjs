import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FileRecord } from './entities/file.entity';

@Injectable()
export class UploadService {
  constructor(@InjectRepository(FileRecord) private repo: Repository<FileRecord>) {}
  async saveFile(data: any) { return this.repo.save(this.repo.create(data)); }
  getFiles(userId?: string) { return this.repo.find({ where: userId ? { userId } : undefined, order: { createdAt: 'DESC' } }); }
  delete(id: string) { return this.repo.delete(id); }
}