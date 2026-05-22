import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UseGuards, Req, UseFilters, UseInterceptors, UploadedFile, HttpCode, HttpStatus } from '@nestjs/common';
import { FileInterceptor } from '../../common/interceptors/fastify-file.interceptor';
import { UserService } from './user.service';

import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/create-address.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UserRequest } from './interfaces/user-request.interface';
import { ResourceOwnerGuard } from './guards/resource-owner.guard';
import { Roles } from './decorators/roles.decorator';
import { UserRole } from './types/user-role.enum';
import { ProfileMapper, AddressMapper } from './mapper/profile.mapper';
import { I18nService } from 'nestjs-i18n';
import { USER_I18N_KEYS } from './i18n/user-i18n-keys.const';
import { UserExceptionFilter } from './filters/user-exception.filter';
import { AuditLogInterceptor } from './interceptors/audit-log.interceptor';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope, PaginatedResponse } from './response/api-envelope.response';
import { ProfileResponse } from './response/profile.response';
import { AddressResponse } from './response/address.response';
import { UserPhoneNumber } from '@prisma/client';

@ApiTags('Users')
@ApiBearerAuth()
@UseFilters(UserExceptionFilter)
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly i18n: I18nService,
  ) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @Roles(UserRole.CUSTOMER, UserRole.MANAGER, UserRole.ADMIN)
  async getMyProfile(@Req() req: UserRequest): Promise<ApiEnvelope<ProfileResponse>> {
    const profile = await this.userService.getProfile(req.user.id);
    const [avatarUrl, coverUrl] = await Promise.all([
      this.userService.getSignedUrlForAvatar(profile.avatarUrl),
      this.userService.getSignedUrlForCover(profile.coverUrl),
    ]);
    const lang = req.headers['accept-language']?.split(',')[0] || 'en';

    return {
      success: true,
      data: ProfileMapper.toResponse(profile, avatarUrl, coverUrl),
      message: await this.i18n.translate(USER_I18N_KEYS.MESSAGES.PROFILE_UPDATED, { lang }), // or just OK
    };
  }

  @Patch('me')
  @UseInterceptors(AuditLogInterceptor)
  @ApiOperation({ summary: 'Update current user profile' })
  @Roles(UserRole.CUSTOMER, UserRole.MANAGER, UserRole.ADMIN)
  async updateMyProfile(
    @Req() req: UserRequest,
    @Body() dto: UpdateProfileDto,
  ): Promise<ApiEnvelope<ProfileResponse>> {
    const profile = await this.userService.updateProfile(req.user.id, dto);
    const [avatarUrl, coverUrl] = await Promise.all([
      this.userService.getSignedUrlForAvatar(profile.avatarUrl),
      this.userService.getSignedUrlForCover(profile.coverUrl),
    ]);
    const lang = req.headers['accept-language']?.split(',')[0] || 'en';

    return {
      success: true,
      data: ProfileMapper.toResponse(profile, avatarUrl, coverUrl),
      message: await this.i18n.translate(USER_I18N_KEYS.MESSAGES.PROFILE_UPDATED, { lang }),
    };
  }

  @Get(':id')
  @UseGuards(ResourceOwnerGuard)
  @ApiOperation({ summary: 'Get user profile by ID' })
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  async getProfile(
    @Req() req: UserRequest,
    @Param('id') id: string,
  ): Promise<ApiEnvelope<ProfileResponse>> {
    const profile = await this.userService.getProfile(id);
    const [avatarUrl, coverUrl] = await Promise.all([
      this.userService.getSignedUrlForAvatar(profile.avatarUrl),
      this.userService.getSignedUrlForCover(profile.coverUrl),
    ]);
    const lang = req.headers['accept-language']?.split(',')[0] || 'en';

    return {
      success: true,
      data: ProfileMapper.toResponse(profile, avatarUrl, coverUrl),
      message: 'OK',
    };
  }

  @Get()
  @ApiOperation({ summary: 'List users' })
  @Roles(UserRole.MANAGER, UserRole.ADMIN)
  async listUsers(@Req() req: UserRequest, @Query() query: PaginationQueryDto): Promise<PaginatedResponse<ProfileResponse>> {
    const [profiles, total] = await this.userService.listUsers(query);
    
    const avatarPaths = profiles.map(p => p.avatarUrl).filter(Boolean) as string[];
    const coverPaths = profiles.map(p => p.coverUrl).filter(Boolean) as string[];

    const [avatarUrls, coverUrls] = await Promise.all([
      this.userService.getSignedUrlsInBulk('user-avatars', avatarPaths),
      this.userService.getSignedUrlsInBulk('user-covers', coverPaths),
    ]);
    
    const totalPages = Math.ceil(total / query.limit);

    return {
      success: true,
      data: ProfileMapper.toListResponse(profiles, avatarUrls, coverUrls),
      message: 'Users fetched successfully',
      meta: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages,
        hasNextPage: query.page < totalPages,
        hasPreviousPage: query.page > 1,
      },
    };
  }

  @Patch(':id/role')
  @UseInterceptors(AuditLogInterceptor)
  @ApiOperation({ summary: 'Assign a new role to user' })
  @Roles(UserRole.ADMIN)
  async assignRole(
    @Req() req: UserRequest,
    @Param('id') id: string,
    @Body() dto: AssignRoleDto,
  ): Promise<ApiEnvelope<ProfileResponse>> {
    const profile = await this.userService.assignRole(id, req.user.id, dto);
    const lang = req.headers['accept-language']?.split(',')[0] || 'en';
    const [avatarUrl, coverUrl] = await Promise.all([
      this.userService.getSignedUrlForAvatar(profile.avatarUrl),
      this.userService.getSignedUrlForCover(profile.coverUrl),
    ]);

    return {
      success: true,
      data: ProfileMapper.toResponse(profile, avatarUrl, coverUrl),
      message: await this.i18n.translate(USER_I18N_KEYS.MESSAGES.ROLE_ASSIGNED, { lang }),
    };
  }

  @Delete(':id')
  @UseInterceptors(AuditLogInterceptor)
  @ApiOperation({ summary: 'Deactivate user' })
  @Roles(UserRole.ADMIN)
  async deactivateUser(
    @Req() req: UserRequest,
    @Param('id') id: string,
  ): Promise<ApiEnvelope<ProfileResponse>> {
    const profile = await this.userService.deactivateUser(id, req.user.id);
    const lang = req.headers['accept-language']?.split(',')[0] || 'en';
    const [avatarUrl, coverUrl] = await Promise.all([
      this.userService.getSignedUrlForAvatar(profile.avatarUrl),
      this.userService.getSignedUrlForCover(profile.coverUrl),
    ]);

    return {
      success: true,
      data: ProfileMapper.toResponse(profile, avatarUrl, coverUrl),
      message: await this.i18n.translate(USER_I18N_KEYS.MESSAGES.USER_DEACTIVATED, { lang }),
    };
  }

  // Address Endpoints
  @Get('me/addresses')
  @ApiOperation({ summary: 'List user addresses' })
  @Roles(UserRole.CUSTOMER, UserRole.MANAGER, UserRole.ADMIN)
  async listAddresses(@Req() req: UserRequest): Promise<ApiEnvelope<AddressResponse[]>> {
    const addresses = await this.userService.listAddresses(req.user.id);
    return {
      success: true,
      data: AddressMapper.toListResponse(addresses),
      message: 'OK',
    };
  }

  @Post('me/addresses')
  @UseInterceptors(AuditLogInterceptor)
  @ApiOperation({ summary: 'Create address' })
  @Roles(UserRole.CUSTOMER, UserRole.MANAGER, UserRole.ADMIN)
  async createAddress(
    @Req() req: UserRequest,
    @Body() dto: CreateAddressDto,
  ): Promise<ApiEnvelope<AddressResponse>> {
    const address = await this.userService.createAddress(req.user.id, dto);
    const lang = req.headers['accept-language']?.split(',')[0] || 'en';

    return {
      success: true,
      data: AddressMapper.toResponse(address),
      message: await this.i18n.translate(USER_I18N_KEYS.MESSAGES.ADDRESS_CREATED, { lang }),
    };
  }

  @Patch('me/addresses/:addrId')
  @UseInterceptors(AuditLogInterceptor)
  @ApiOperation({ summary: 'Update address' })
  @Roles(UserRole.CUSTOMER, UserRole.MANAGER, UserRole.ADMIN)
  async updateAddress(
    @Req() req: UserRequest,
    @Param('addrId') addrId: string,
    @Body() dto: UpdateAddressDto,
  ): Promise<ApiEnvelope<AddressResponse>> {
    const address = await this.userService.updateAddress(req.user.id, addrId, dto);
    const lang = req.headers['accept-language']?.split(',')[0] || 'en';

    return {
      success: true,
      data: AddressMapper.toResponse(address),
      message: await this.i18n.translate(USER_I18N_KEYS.MESSAGES.ADDRESS_UPDATED, { lang }),
    };
  }

  @Delete('me/addresses/:addrId')
  @UseInterceptors(AuditLogInterceptor)
  @ApiOperation({ summary: 'Delete address' })
  @Roles(UserRole.CUSTOMER, UserRole.MANAGER, UserRole.ADMIN)
  async deleteAddress(
    @Req() req: UserRequest,
    @Param('addrId') addrId: string,
  ): Promise<ApiEnvelope<AddressResponse>> {
    const address = await this.userService.deleteAddress(req.user.id, addrId);
    const lang = req.headers['accept-language']?.split(',')[0] || 'en';

    return {
      success: true,
      data: AddressMapper.toResponse(address),
      message: await this.i18n.translate(USER_I18N_KEYS.MESSAGES.ADDRESS_DELETED, { lang }),
    };
  }

  // Phone Number Endpoints
  @Get('me/phone-numbers')
  @ApiOperation({ summary: 'List user phone numbers' })
  @Roles(UserRole.CUSTOMER, UserRole.MANAGER, UserRole.ADMIN)
  async listPhoneNumbers(@Req() req: UserRequest): Promise<ApiEnvelope<UserPhoneNumber[]>> {
    const profile = await this.userService.getProfile(req.user.id);
    return {
      success: true,
      data: profile.phoneNumbers,
      message: 'OK',
    };
  }

  @Post('me/phone-numbers')
  @UseInterceptors(AuditLogInterceptor)
  @ApiOperation({ summary: 'Add phone number' })
  @Roles(UserRole.CUSTOMER, UserRole.MANAGER, UserRole.ADMIN)
  async addPhoneNumber(
    @Req() req: UserRequest,
    @Body() dto: { number: string; label?: string; isDefault?: boolean },
  ): Promise<ApiEnvelope<UserPhoneNumber>> {
    const profile = await this.userService.getProfile(req.user.id);
    const phone = await this.userService.addPhoneNumber(profile.id, dto);
    return {
      success: true,
      data: phone,
      message: 'Phone number added',
    };
  }

  @Delete('me/phone-numbers/:id')
  @UseInterceptors(AuditLogInterceptor)
  @ApiOperation({ summary: 'Delete phone number' })
  @Roles(UserRole.CUSTOMER, UserRole.MANAGER, UserRole.ADMIN)
  async deletePhoneNumber(
    @Req() req: UserRequest,
    @Param('id') id: string,
  ): Promise<ApiEnvelope<null>> {
    const profile = await this.userService.getProfile(req.user.id);
    await this.userService.deletePhoneNumber(profile.id, id);
    return {
      success: true,
      data: null,
      message: 'Phone number deleted',
    };
  }

  // Avatar and Cover Endpoints
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file', { destination: './uploads' }))
  @ApiOperation({ summary: 'Upload current user avatar' })
  @Roles(UserRole.CUSTOMER, UserRole.MANAGER, UserRole.ADMIN)
  async uploadAvatar(
    @Req() req: UserRequest,
    @UploadedFile() file: { buffer: Buffer; mimetype: string },
  ): Promise<ApiEnvelope<ProfileResponse>> {
    const profile = await this.userService.uploadAvatar(req.user.id, file);
    const [avatarUrl, coverUrl] = await Promise.all([
      this.userService.getSignedUrlForAvatar(profile.avatarUrl),
      this.userService.getSignedUrlForCover(profile.coverUrl),
    ]);
    const lang = req.headers['accept-language']?.split(',')[0] || 'en';

    return {
      success: true,
      data: ProfileMapper.toResponse(profile, avatarUrl, coverUrl),
      message: await this.i18n.translate(USER_I18N_KEYS.MESSAGES.AVATAR_UPLOADED, { lang }),
    };
  }

  @Delete('me/avatar')
  @UseInterceptors(AuditLogInterceptor)
  @ApiOperation({ summary: 'Remove current user avatar' })
  @Roles(UserRole.CUSTOMER, UserRole.MANAGER, UserRole.ADMIN)
  async removeAvatar(@Req() req: UserRequest): Promise<ApiEnvelope<ProfileResponse>> {
    const profile = await this.userService.removeAvatar(req.user.id);
    const [avatarUrl, coverUrl] = await Promise.all([
      this.userService.getSignedUrlForAvatar(profile.avatarUrl),
      this.userService.getSignedUrlForCover(profile.coverUrl),
    ]);
    const lang = req.headers['accept-language']?.split(',')[0] || 'en';

    return {
      success: true,
      data: ProfileMapper.toResponse(profile, avatarUrl, coverUrl),
      message: await this.i18n.translate(USER_I18N_KEYS.MESSAGES.AVATAR_REMOVED, { lang }),
    };
  }

  @Post('me/cover')
  @UseInterceptors(FileInterceptor('file', { destination: './uploads' }))
  @ApiOperation({ summary: 'Upload current user cover' })
  @Roles(UserRole.CUSTOMER, UserRole.MANAGER, UserRole.ADMIN)
  async uploadCover(
    @Req() req: UserRequest,
    @UploadedFile() file: { buffer: Buffer; mimetype: string },
  ): Promise<ApiEnvelope<ProfileResponse>> {
    const profile = await this.userService.uploadCover(req.user.id, file);
    const [avatarUrl, coverUrl] = await Promise.all([
      this.userService.getSignedUrlForAvatar(profile.avatarUrl),
      this.userService.getSignedUrlForCover(profile.coverUrl),
    ]);
    const lang = req.headers['accept-language']?.split(',')[0] || 'en';

    return {
      success: true,
      data: ProfileMapper.toResponse(profile, avatarUrl, coverUrl),
      message: await this.i18n.translate(USER_I18N_KEYS.MESSAGES.COVER_UPLOADED, { lang }),
    };
  }

  @Delete('me/cover')
  @UseInterceptors(AuditLogInterceptor)
  @ApiOperation({ summary: 'Remove current user cover' })
  @Roles(UserRole.CUSTOMER, UserRole.MANAGER, UserRole.ADMIN)
  async removeCover(@Req() req: UserRequest): Promise<ApiEnvelope<ProfileResponse>> {
    const profile = await this.userService.removeCover(req.user.id);
    const [avatarUrl, coverUrl] = await Promise.all([
      this.userService.getSignedUrlForAvatar(profile.avatarUrl),
      this.userService.getSignedUrlForCover(profile.coverUrl),
    ]);
    const lang = req.headers['accept-language']?.split(',')[0] || 'en';

    return {
      success: true,
      data: ProfileMapper.toResponse(profile, avatarUrl, coverUrl),
      message: await this.i18n.translate(USER_I18N_KEYS.MESSAGES.COVER_REMOVED, { lang }),
    };
  }
}
