import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ContentService } from './content.service';
import { ApiResponse } from '../../../common/utils/api-response';

@Controller('pages')
export class ContentController {
  constructor(private readonly service: ContentService) {}

  @Get() getPages() { return ApiResponse.success(this.service.getPages()); }
  @Get(':slug') getPage(@Param('slug') slug: string) { return ApiResponse.success(this.service.getPageBySlug(slug)); }
  @Post() createPage(@Body() body: any) { return ApiResponse.success(this.service.createPage(body), 'Page created'); }
  @Put(':id') updatePage(@Param('id') id: string, @Body() body: any) { return ApiResponse.success(this.service.updatePage(id, body)); }
}

@Controller('policies')
export class PolicyController {
  constructor(private readonly service: ContentService) {}

  @Get() getPolicies() { return ApiResponse.success(this.service.getPolicies()); }
  @Get(':slug') getPolicy(@Param('slug') slug: string) { return ApiResponse.success(this.service.getPolicyBySlug(slug)); }
  @Post() createPolicy(@Body() body: any) { return ApiResponse.success(this.service.createPolicy(body), 'Policy created'); }
  @Put(':id') updatePolicy(@Param('id') id: string, @Body() body: any) { return ApiResponse.success(this.service.updatePolicy(id, body)); }
}

@Controller('testimonials')
export class TestimonialController {
  constructor(private readonly service: ContentService) {}

  @Get() getTestimonials() { return ApiResponse.success(this.service.getTestimonials()); }
  @Post() create(@Body() body: any) { return ApiResponse.success(this.service.createTestimonial(body), 'Testimonial created'); }
  @Put(':id') update(@Param('id') id: string, @Body() body: any) { return ApiResponse.success(this.service.updateTestimonial(id, body)); }
  @Delete(':id') delete(@Param('id') id: string) { return ApiResponse.success(this.service.deleteTestimonial(id), 'Testimonial deleted'); }
}

@Controller('social')
export class SocialMediaController {
  constructor(private readonly service: ContentService) {}

  @Get() getSocialMedia() { return ApiResponse.success(this.service.getSocialMedia()); }
  @Post() create(@Body() body: any) { return ApiResponse.success(this.service.createSocialMedia(body), 'Social link created'); }
  @Put(':id') update(@Param('id') id: string, @Body() body: any) { return ApiResponse.success(this.service.updateSocialMedia(id, body)); }
  @Delete(':id') delete(@Param('id') id: string) { return ApiResponse.success(this.service.deleteSocialMedia(id), 'Social link deleted'); }
}