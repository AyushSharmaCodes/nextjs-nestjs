import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../infrastructure/database/prisma/prisma.service';
import { Profile, UserAddress, Prisma, Role, UserPhoneNumber } from '@prisma/client';
import { SortOrder } from './types/sort-order.enum';
import { PaginationQueryDto } from './dto/pagination-query.dto';

export type ProfileWithRole = Profile & { 
  role: Role;
  user?: {
    lastLoginAt: Date | null;
    createdAt: Date;
    gender: string | null;
    dob: Date | null;
    nationality: string | null;
  } | null;
  phoneNumbers: UserPhoneNumber[];
};

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findProfileByUserId(userId: string): Promise<ProfileWithRole | null> {
    return this.prisma.profile.findFirst({
      where: { userId, deletedAt: null },
      include: { 
        role: true,
        user: {
          select: {
            lastLoginAt: true,
            createdAt: true,
            gender: true,
            dob: true,
            nationality: true,
          }
        },
        phoneNumbers: true,
      },
    }) as Promise<ProfileWithRole | null>;
  }

  async findProfileById(id: string): Promise<ProfileWithRole | null> {
    return this.prisma.profile.findFirst({
      where: { id, deletedAt: null },
      include: { 
        role: true,
        user: {
          select: {
            lastLoginAt: true,
            createdAt: true,
            gender: true,
            dob: true,
            nationality: true,
          }
        },
        phoneNumbers: true,
      },
    }) as Promise<ProfileWithRole | null>;
  }

  async createProfile(data: Prisma.ProfileUncheckedCreateInput): Promise<ProfileWithRole> {
    return this.prisma.profile.create({
      data,
      include: { 
        role: true,
        user: {
          select: {
            lastLoginAt: true,
            createdAt: true,
            gender: true,
            dob: true,
            nationality: true,
          }
        },
        phoneNumbers: true,
      },
    }) as unknown as Promise<ProfileWithRole>;
  }

  async updateProfile(id: string, data: Prisma.ProfileUpdateInput): Promise<ProfileWithRole> {
    return this.prisma.profile.update({
      where: { id },
      data,
      include: { 
        role: true,
        user: {
          select: {
            lastLoginAt: true,
            createdAt: true,
            gender: true,
            dob: true,
            nationality: true,
          }
        },
        phoneNumbers: true,
      },
    }) as unknown as Promise<ProfileWithRole>;
  }

  async getRoleByName(name: string): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { name },
    });
  }

  async listProfiles(query: PaginationQueryDto): Promise<[ProfileWithRole[], number]> {
    const where: Prisma.ProfileWhereInput = {
      deletedAt: null,
    };

    if (query.role) {
      where.role = {
        name: query.role,
      };
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
    
    // Sort logic
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
        include: { 
          role: true,
          user: {
            select: {
              lastLoginAt: true,
              createdAt: true,
              gender: true,
              dob: true,
              nationality: true,
            }
          },
          phoneNumbers: true,
        },
      }),
      this.prisma.profile.count({ where }),
    ]);

    return [items as ProfileWithRole[], total];
  }

  async updateAvatarPath(id: string, path: string | null): Promise<ProfileWithRole> {
    return this.prisma.profile.update({
      where: { id },
      data: { avatarUrl: path },
      include: { 
        role: true,
        user: {
          select: {
            lastLoginAt: true,
            createdAt: true,
            gender: true,
            dob: true,
            nationality: true,
          }
        },
        phoneNumbers: true,
      },
    }) as unknown as Promise<ProfileWithRole>;
  }

  async updateCoverPath(id: string, path: string | null): Promise<ProfileWithRole> {
    return this.prisma.profile.update({
      where: { id },
      data: { coverUrl: path },
      include: { 
        role: true,
        user: {
          select: {
            lastLoginAt: true,
            createdAt: true,
            gender: true,
            dob: true,
            nationality: true,
          }
        },
        phoneNumbers: true,
      },
    }) as unknown as Promise<ProfileWithRole>;
  }

  // Address methods
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

    // Atomic swap if this is the new default
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
      return this.prisma.userAddress.update({
        where: { id },
        data,
      });
    }

    if (!profileId) {
      throw new Error('profileId is required to update default address atomically');
    }

    // Atomic swap
    return this.prisma.$transaction(async (tx) => {
      await tx.userAddress.updateMany({
        where: { profileId, isDefault: true },
        data: { isDefault: false },
      });
      return tx.userAddress.update({
        where: { id },
        data,
      });
    });
  }

  async deleteAddress(id: string): Promise<UserAddress> {
    return this.prisma.userAddress.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }

  // Phone number methods
  async addPhoneNumber(data: Prisma.UserPhoneNumberUncheckedCreateInput): Promise<UserPhoneNumber> {
    if (!data.isDefault) {
      return this.prisma.userPhoneNumber.create({ data });
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.userPhoneNumber.updateMany({
        where: { profileId: data.profileId, isDefault: true },
        data: { isDefault: false },
      });
      return tx.userPhoneNumber.create({ data });
    });
  }

  async getPhoneNumber(id: string): Promise<UserPhoneNumber | null> {
    return this.prisma.userPhoneNumber.findUnique({ where: { id } });
  }

  async deletePhoneNumber(id: string): Promise<UserPhoneNumber> {
    return this.prisma.userPhoneNumber.delete({ where: { id } });
  }

  async unsetDefaultAddress(profileId: string): Promise<void> {
    await this.prisma.userAddress.updateMany({
      where: { profileId, isDefault: true },
      data: { isDefault: false },
    });
  }

  // Audit logging
  async logAudit(data: Prisma.AuditLogUncheckedCreateInput): Promise<void> {
    await this.prisma.auditLog.create({ data });
  }
}
