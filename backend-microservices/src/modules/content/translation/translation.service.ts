import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Translation, TranslationMetadata } from './entities/translation.entity';

@Injectable()
export class TranslationService {
  constructor(
    @InjectRepository(Translation) private transRepo: Repository<Translation>,
    @InjectRepository(TranslationMetadata) private metaRepo: Repository<TranslationMetadata>,
  ) {}

  async getTranslations(language: string, namespace?: string) {
    const where: any = { language, isActive: true }; // ts-audit-ignore
    if (namespace) where.namespace = namespace;
    const translations = await this.transRepo.find({ where });
    return translations.reduce((acc, t) => ({ ...acc, [t.key]: t.value }), {});
  }

  async getLanguages() {
    return this.metaRepo.find({ where: { isActive: true }, order: { displayOrder: 'ASC' } });
  }

  async setTranslation(language: string, namespace: string, key: string, value: string) {
    const existing = await this.transRepo.findOne({ where: { language, namespace, key } });
    if (existing) {
      await this.transRepo.update(existing.id, { value });
      return this.transRepo.findOne({ where: { id: existing.id } });
    }
    return this.transRepo.save(this.transRepo.create({ language, namespace, key, value }));
  }

  async bulkSet(language: string, namespace: string, translations: Record<string, string>) {
    const results = [];
    for (const [key, value] of Object.entries(translations)) {
      const result = await this.setTranslation(language, namespace, key, value);
      results.push(result);
    }
    return results;
  }

  async deleteTranslation(id: string) {
    return this.transRepo.delete(id);
  }

  async updateTranslationValue(id: string, value: string) {
    await this.transRepo.update(id, { value });
    return this.transRepo.findOne({ where: { id } });
  }

  async addLanguage(data: Partial<TranslationMetadata>) {
    if (data.isDefault) {
      await this.metaRepo.update({ isDefault: true }, { isDefault: false });
    }
    return this.metaRepo.save(this.metaRepo.create(data));
  }

  async updateLanguage(id: string, data: Partial<TranslationMetadata>) {
    if (data.isDefault) {
      await this.metaRepo.update({ isDefault: true }, { isDefault: false });
    }
    await this.metaRepo.update(id, data);
    return this.metaRepo.findOne({ where: { id } });
  }
}