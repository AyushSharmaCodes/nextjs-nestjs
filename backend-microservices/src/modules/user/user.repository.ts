import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { Profile, UserAddress, Prisma, Role } from '@prisma/client';
import { SortOrder } from './types/sort-order.enum';
import { PaginationQueryDto } from './dto/pagination-query.dto';

// ─── Enriched phone number shape returned from all profile queries ───────────
export type PhoneNumberWithCountry = {
  id: string;
  profileId: string;
  countryId: number | null;
  country: {
    id: number;
    iso2: string;
    phonecode: string | null;
    emoji: string | null;
  } | null;
  number: string;
  label: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ProfileWithRole = Profile & { 
  role: Role;
  user?: {
    lastLoginAt: Date | null;
    createdAt: Date;
    genderRelation: { id: string; name: string; } | null;
    dob: Date | null;
    nationalityCountry: { id: number; iso2: string; name: string; phonecode: string | null; currency: string | null; } | null;
    preferredCurrency: string | null;
    emailNotification: boolean;
  } | null;
  phoneNumbers: PhoneNumberWithCountry[];
};

// ─── Reusable include fragment ────────────────────────────────────────────────
const PROFILE_INCLUDE = {
  role: true,
  user: {
    select: {
      lastLoginAt: true,
      createdAt: true,
      genderRelation: {
        select: { id: true, name: true },
      },
      dob: true,
      nationalityCountry: {
        select: { id: true, iso2: true, name: true, phonecode: true, currency: true },
      },
      preferredCurrency: true,
      emailNotification: true,
    },
  },
  phoneNumbers: {
    include: {
      country: {
        select: { id: true, iso2: true, phonecode: true, emoji: true },
      },
    },
  },
} as const;

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProfileByUserId(userId: string): Promise<ProfileWithRole | null> {
    return this.prisma.profile.findFirst({
      where: { userId, deletedAt: null },
      include: PROFILE_INCLUDE,
    }) as Promise<ProfileWithRole | null>;
  }

  async findProfileById(id: string): Promise<ProfileWithRole | null> {
    return this.prisma.profile.findFirst({
      where: { id, deletedAt: null },
      include: PROFILE_INCLUDE,
    }) as Promise<ProfileWithRole | null>;
  }

  async createProfile(data: Prisma.ProfileUncheckedCreateInput): Promise<ProfileWithRole> {
    return this.prisma.profile.create({
      data,
      include: PROFILE_INCLUDE,
    // We double cast through unknown because Prisma's dynamically-computed relation includes do not natively match our custom ProfileWithRole type.
    }) as unknown as Promise<ProfileWithRole>;
  }

  async updateProfile(id: string, data: Prisma.ProfileUpdateInput): Promise<ProfileWithRole> {
    return this.prisma.profile.update({
      where: { id },
      data,
      include: PROFILE_INCLUDE,
    // We double cast through unknown because Prisma's dynamically-computed relation includes do not natively match our custom ProfileWithRole type.
    }) as unknown as Promise<ProfileWithRole>;
  }

  async getRoleByName(name: string): Promise<Role | null> {
    return this.prisma.role.findUnique({ where: { name } });
  }

  async listProfiles(query: PaginationQueryDto): Promise<[ProfileWithRole[], number]> {
    const where: Prisma.ProfileWhereInput = { deletedAt: null };

    if (query.role) {
      where.role = { name: query.role };
    }

    if (query.isActive !== undefined) {
      where.isActive = query.isActive;
    }

    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
      ];
    }

    const skip = (query.page - 1) * query.limit;

    let orderBy: Prisma.ProfileOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sortBy === 'last_name') {
      orderBy = { lastName: query.sortOrder };
    } else if (query.sortBy === 'role') {
      orderBy = { role: { name: query.sortOrder } };
    } else if (query.sortBy === 'created_at') {
      orderBy = { createdAt: query.sortOrder };
    }

    const [items, total] = await Promise.all([
      this.prisma.profile.findMany({
        where,
        orderBy,
        skip,
        take: query.limit,
        include: PROFILE_INCLUDE,
      }),
      this.prisma.profile.count({ where }),
    ]);

    return [items as ProfileWithRole[], total];
  }

  async updateAvatarPath(id: string, path: string | null): Promise<ProfileWithRole> {
    return this.prisma.profile.update({
      where: { id },
      data: { avatarUrl: path },
      include: PROFILE_INCLUDE,
    // We double cast through unknown because Prisma's dynamically-computed relation includes do not natively match our custom ProfileWithRole type.
    }) as unknown as Promise<ProfileWithRole>;
  }

  async updateCoverPath(id: string, path: string | null): Promise<ProfileWithRole> {
    return this.prisma.profile.update({
      where: { id },
      data: { coverUrl: path },
      include: PROFILE_INCLUDE,
    // We double cast through unknown because Prisma's dynamically-computed relation includes do not natively match our custom ProfileWithRole type.
    }) as unknown as Promise<ProfileWithRole>;
  }

  // ─── Address methods ───────────────────────────────────────────────────────

  async listAddresses(profileId: string): Promise<UserAddress[]> {
    return this.prisma.userAddress.findMany({
      where: { profileId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getAddress(id: string, profileId: string): Promise<UserAddress | null> {
    return this.prisma.userAddress.findFirst({
      where: { id, profileId, deletedAt: null },
    });
  }

  async createAddress(data: Prisma.UserAddressUncheckedCreateInput): Promise<UserAddress> {
    if (!data.isDefault) {
      return this.prisma.userAddress.create({ data });
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.userAddress.updateMany({
        where: { profileId: data.profileId, isDefault: true },
        data: { isDefault: false },
      });
      return tx.userAddress.create({ data });
    });
  }

  async updateAddress(id: string, data: Prisma.UserAddressUpdateInput, profileId?: string): Promise<UserAddress> {
    if (!data.isDefault) {
      return this.prisma.userAddress.update({ where: { id }, data });
    }

    if (!profileId) {
      throw new Error('profileId is required to update default address atomically');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.userAddress.updateMany({
        where: { profileId, isDefault: true },
        data: { isDefault: false },
      });
      return tx.userAddress.update({ where: { id }, data });
    });
  }

  async deleteAddress(id: string): Promise<UserAddress> {
    return this.prisma.userAddress.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // ─── Phone number methods ──────────────────────────────────────────────────

  async addPhoneNumber(data: Prisma.UserPhoneNumberUncheckedCreateInput): Promise<PhoneNumberWithCountry> {
    if (!data.isDefault) {
      return this.prisma.userPhoneNumber.create({
        data,
        include: { country: { select: { id: true, iso2: true, phonecode: true, emoji: true } } },
      // We double cast through unknown because Prisma's dynamically-computed relation includes do not natively match our custom PhoneNumberWithCountry type.
      }) as unknown as Promise<PhoneNumberWithCountry>;
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.userPhoneNumber.updateMany({
        where: { profileId: data.profileId, isDefault: true },
        data: { isDefault: false },
      });
      return tx.userPhoneNumber.create({
        data,
        include: { country: { select: { id: true, iso2: true, phonecode: true, emoji: true } } },
      });
    // We double cast through unknown because Prisma's dynamically-computed relation includes do not natively match our custom PhoneNumberWithCountry type.
    }) as unknown as Promise<PhoneNumberWithCountry>;
  }

  async getPhoneNumber(id: string): Promise<PhoneNumberWithCountry | null> {
    return this.prisma.userPhoneNumber.findUnique({
      where: { id },
      include: { country: { select: { id: true, iso2: true, phonecode: true, emoji: true } } },
    // We double cast through unknown because Prisma's dynamically-computed relation includes do not natively match our custom PhoneNumberWithCountry type.
    }) as unknown as Promise<PhoneNumberWithCountry | null>;
  }

  async deletePhoneNumber(id: string) {
    return this.prisma.userPhoneNumber.delete({ where: { id } });
  }

  /**
   * Update only the country FK on an existing default phone number record
   * (when the user changes their dial-code country but not the number text).
   */
  async updatePhoneNumberCountry(profileId: string, countryId: number): Promise<void> {
    const existing =
      (await this.prisma.userPhoneNumber.findFirst({ where: { profileId, isDefault: true } })) ||
      (await this.prisma.userPhoneNumber.findFirst({ where: { profileId } }));
    if (existing) {
      await this.prisma.userPhoneNumber.update({
        where: { id: existing.id },
        data: { countryId },
      });
    }
  }

  /**
   * Upserts the single default phone number for a profile.
   * If countryId is provided, it is stored as the FK linking this
   * phone number to the country whose phonecode is the dial prefix.
   */
  async upsertDefaultPhoneNumber(
    profileId: string,
    number: string,
    countryId?: number | null,
  ): Promise<PhoneNumberWithCountry> {
    const existing =
      (await this.prisma.userPhoneNumber.findFirst({ where: { profileId, isDefault: true } })) ||
      (await this.prisma.userPhoneNumber.findFirst({ where: { profileId } }));

    const countryUpdate = countryId !== undefined ? { countryId } : {};

    if (existing) {
      return this.prisma.userPhoneNumber.update({
        where: { id: existing.id },
        data: { number, ...countryUpdate },
        include: { country: { select: { id: true, iso2: true, phonecode: true, emoji: true } } },
      // We double cast through unknown because Prisma's dynamically-computed relation includes do not natively match our custom PhoneNumberWithCountry type.
      }) as unknown as Promise<PhoneNumberWithCountry>;
    }

    return this.prisma.userPhoneNumber.create({
      data: {
        profileId,
        number,
        isDefault: true,
        label: 'MOBILE',
        ...countryUpdate,
      },
      include: { country: { select: { id: true, iso2: true, phonecode: true, emoji: true } } },
    // We double cast through unknown because Prisma's dynamically-computed relation includes do not natively match our custom PhoneNumberWithCountry type.
    }) as unknown as Promise<PhoneNumberWithCountry>;
  }

  async unsetDefaultAddress(profileId: string): Promise<void> {
    await this.prisma.userAddress.updateMany({
      where: { profileId, isDefault: true },
      data: { isDefault: false },
    });
  }

  // ─── Audit logging ─────────────────────────────────────────────────────────

  async logAudit(data: Prisma.AuditLogUncheckedCreateInput): Promise<void> {
    await this.prisma.auditLog.create({ data });
  }

  async findGenders() {
    return this.prisma.gender.findMany({ orderBy: { name: 'asc' } });
  }
}
