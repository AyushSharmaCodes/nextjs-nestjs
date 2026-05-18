import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page, Policy, Testimonial, SocialMedia } from './entities/content.entity';

@Injectable()
export class ContentService {
  constructor(
    @InjectRepository(Page) private pageRepo: Repository<Page>,
    @InjectRepository(Policy) private policyRepo: Repository<Policy>,
    @InjectRepository(Testimonial) private testimonialRepo: Repository<Testimonial>,
    @InjectRepository(SocialMedia) private socialMediaRepo: Repository<SocialMedia>,
  ) {}

  // Pages
  async getPages() {
    return this.pageRepo.find({ where: { isPublished: true }, order: { title: 'ASC' } });
  }

  async getPageBySlug(slug: string) {
    return this.pageRepo.findOne({ where: { slug, isPublished: true } });
  }

  async createPage(data: Partial<Page>) {
    return this.pageRepo.save(this.pageRepo.create(data));
  }

  async updatePage(id: string, data: Partial<Page>) {
    await this.pageRepo.update(id, data);
    return this.pageRepo.findOne({ where: { id } });
  }

  // Policies
  async getPolicies() {
    return this.policyRepo.find({ where: { isActive: true }, order: { title: 'ASC' } });
  }

  async getPolicyBySlug(slug: string) {
    return this.policyRepo.findOne({ where: { slug, isActive: true } });
  }

  async createPolicy(data: Partial<Policy>) {
    return this.policyRepo.save(this.policyRepo.create(data));
  }

  async updatePolicy(id: string, data: Partial<Policy>) {
    await this.policyRepo.update(id, data);
    return this.policyRepo.findOne({ where: { id } });
  }

  // Testimonials
  async getTestimonials() {
    return this.testimonialRepo.find({ where: { isActive: true }, order: { displayOrder: 'ASC' } });
  }

  async createTestimonial(data: Partial<Testimonial>) {
    return this.testimonialRepo.save(this.testimonialRepo.create(data));
  }

  async updateTestimonial(id: string, data: Partial<Testimonial>) {
    await this.testimonialRepo.update(id, data);
    return this.testimonialRepo.findOne({ where: { id } });
  }

  async deleteTestimonial(id: string) {
    return this.testimonialRepo.delete(id);
  }

  // Social Media
  async getSocialMedia() {
    return this.socialMediaRepo.find({ where: { isActive: true }, order: { displayOrder: 'ASC' } });
  }

  async createSocialMedia(data: Partial<SocialMedia>) {
    return this.socialMediaRepo.save(this.socialMediaRepo.create(data));
  }

  async updateSocialMedia(id: string, data: Partial<SocialMedia>) {
    await this.socialMediaRepo.update(id, data);
    return this.socialMediaRepo.findOne({ where: { id } });
  }

  async deleteSocialMedia(id: string) {
    return this.socialMediaRepo.delete(id);
  }
}