import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Page, Policy, Testimonial, SocialMedia } from './entities/content.entity';
import { ContentService } from './content.service';
import { ContentController, PolicyController, TestimonialController, SocialMediaController } from './content.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Page, Policy, Testimonial, SocialMedia])],
  controllers: [ContentController, PolicyController, TestimonialController, SocialMediaController],
  providers: [ContentService],
  exports: [ContentService],
})
export class ContentModule {}