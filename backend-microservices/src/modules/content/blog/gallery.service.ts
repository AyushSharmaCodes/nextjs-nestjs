import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gallery } from './entities/gallery.entity';
import { GalleryFolder, GalleryItem, GalleryVideo } from './entities/gallery-extended.entity';

@Injectable()
export class GalleryService {
  constructor(
    @InjectRepository(Gallery) private galleryRepo: Repository<Gallery>,
    @InjectRepository(GalleryFolder) private folderRepo: Repository<GalleryFolder>,
    @InjectRepository(GalleryItem) private itemRepo: Repository<GalleryItem>,
    @InjectRepository(GalleryVideo) private videoRepo: Repository<GalleryVideo>,
  ) {}

  // Basic Gallery (existing)
  async getAll() { return this.galleryRepo.find({ where: { isActive: true }, order: { createdAt: 'DESC' } }); }
  async create(data: any) { return this.galleryRepo.save(this.galleryRepo.create(data)); }

  // Folders
  async getFolders() { return this.folderRepo.find({ where: { isActive: true }, order: { displayOrder: 'ASC' } }); }
  async getFolderById(id: string) { return this.folderRepo.findOne({ where: { id } }); }
  async createFolder(data: Partial<GalleryFolder>) { return this.folderRepo.save(this.folderRepo.create(data)); }
  async updateFolder(id: string, data: Partial<GalleryFolder>) { await this.folderRepo.update(id, data); return this.folderRepo.findOne({ where: { id } }); }
  async deleteFolder(id: string) { return this.folderRepo.delete(id); }

  // Items
  async getItems(folderId?: string) {
    const where: any = { isActive: true };
    if (folderId) where.folderId = folderId;
    return this.itemRepo.find({ where, order: { displayOrder: 'ASC' } });
  }
  async createItem(data: Partial<GalleryItem>) { return this.itemRepo.save(this.itemRepo.create(data)); }
  async updateItem(id: string, data: Partial<GalleryItem>) { await this.itemRepo.update(id, data); return this.itemRepo.findOne({ where: { id } }); }
  async deleteItem(id: string) { return this.itemRepo.delete(id); }

  // Videos
  async getVideos(folderId?: string) {
    const where: any = { isActive: true };
    if (folderId) where.folderId = folderId;
    return this.videoRepo.find({ where, order: { displayOrder: 'ASC' } });
  }
  async createVideo(data: Partial<GalleryVideo>) { return this.videoRepo.save(this.videoRepo.create(data)); }
  async updateVideo(id: string, data: Partial<GalleryVideo>) { await this.videoRepo.update(id, data); return this.videoRepo.findOne({ where: { id } }); }
  async deleteVideo(id: string) { return this.videoRepo.delete(id); }
}