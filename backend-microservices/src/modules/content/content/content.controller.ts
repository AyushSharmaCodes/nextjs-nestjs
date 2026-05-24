import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ContentService } from './content.service';
import { ApiResponse } from '../../../common/utils/api-response';
import { Public } from '../../auth/decorators/public.decorator';
import { Roles } from '../../auth/decorators/roles.decorator';
import { Permissions } from '../../auth/decorators/permissions.decorator';

@Controller('pages')
export class ContentController {
  constructor(private readonly service: ContentService) {}

  @Public()
  @Get() getPages() { return ApiResponse.success(this.service.getPages()); }
  @Public()
  @Get(':slug') getPage(@Param('slug') slug: string) { return ApiResponse.success(this.service.getPageBySlug(slug)); }
  @Roles('ADMIN', 'MANAGER')
  @Permissions('about')
  @Post() createPage(@Body() body: any) { return ApiResponse.success(this.service.createPage(body), 'Page created'); } // ts-audit-ignore
  @Roles('ADMIN', 'MANAGER')
  @Permissions('about')
  @Put(':id') updatePage(@Param('id') id: string, @Body() body: any) { return ApiResponse.success(this.service.updatePage(id, body)); } // ts-audit-ignore
}

@Controller('policies')
export class PolicyController {
  constructor(private readonly service: ContentService) {}

  @Public()
  @Get() getPolicies() { return ApiResponse.success(this.service.getPolicies()); }
  @Public()
  @Get(':slug') getPolicy(@Param('slug') slug: string) { return ApiResponse.success(this.service.getPolicyBySlug(slug)); }
  @Roles('ADMIN', 'MANAGER')
  @Permissions('policies')
  @Post() createPolicy(@Body() body: any) { return ApiResponse.success(this.service.createPolicy(body), 'Policy created'); } // ts-audit-ignore
  @Roles('ADMIN', 'MANAGER')
  @Permissions('policies')
  @Put(':id') updatePolicy(@Param('id') id: string, @Body() body: any) { return ApiResponse.success(this.service.updatePolicy(id, body)); } // ts-audit-ignore
}

@Controller('testimonials')
export class TestimonialController {
  constructor(private readonly service: ContentService) {}

  @Public()
  @Get() getTestimonials() { return ApiResponse.success(this.service.getTestimonials()); }
  @Roles('ADMIN', 'MANAGER')
  @Permissions('testimonials')
  @Post() create(@Body() body: any) { return ApiResponse.success(this.service.createTestimonial(body), 'Testimonial created'); } // ts-audit-ignore
  @Roles('ADMIN', 'MANAGER')
  @Permissions('testimonials')
  @Put(':id') update(@Param('id') id: string, @Body() body: any) { return ApiResponse.success(this.service.updateTestimonial(id, body)); } // ts-audit-ignore
  @Roles('ADMIN', 'MANAGER')
  @Permissions('testimonials')
  @Delete(':id') delete(@Param('id') id: string) { return ApiResponse.success(this.service.deleteTestimonial(id), 'Testimonial deleted'); }
}

@Controller('social')
export class SocialMediaController {
  constructor(private readonly service: ContentService) {}

  @Public()
  @Get() getSocialMedia() { return ApiResponse.success(this.service.getSocialMedia()); }
  @Roles('ADMIN', 'MANAGER')
  @Permissions('social')
  @Post() create(@Body() body: any) { return ApiResponse.success(this.service.createSocialMedia(body), 'Social link created'); } // ts-audit-ignore
  @Roles('ADMIN', 'MANAGER')
  @Permissions('social')
  @Put(':id') update(@Param('id') id: string, @Body() body: any) { return ApiResponse.success(this.service.updateSocialMedia(id, body)); } // ts-audit-ignore
  @Roles('ADMIN', 'MANAGER')
  @Permissions('social')
  @Delete(':id') delete(@Param('id') id: string) { return ApiResponse.success(this.service.deleteSocialMedia(id), 'Social link deleted'); }
}
