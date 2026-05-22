import { Profile, Role, UserAddress } from '@prisma/client';
import { ProfileResponse } from '../response/profile.response';
import { AddressResponse } from '../response/address.response';
import { ProfileWithRole } from '../user.repository';

export class ProfileMapper {
  static toResponse(
    row: ProfileWithRole,
    signedAvatarUrl: string | null = null,
    signedCoverUrl: string | null = null
  ): ProfileResponse {
    return {
      id: row.id,
      userId: row.userId,
      role: row.role.name,
      firstName: row.firstName,
      lastName: row.lastName,
      gender: row.user?.gender || null,
      dob: row.user?.dob?.toISOString() || null,
      nationality: row.user?.nationality || null,
      locale: row.locale,
      timezone: row.timezone,
      isActive: row.isActive,
      isVerified: row.isVerified,
      avatarUrl: signedAvatarUrl,
      coverUrl: signedCoverUrl,
      lastLoginAt: row.user?.lastLoginAt?.toISOString() || null,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      phoneNumbers: row.phoneNumbers.map(p => ({
        id: p.id,
        number: p.number,
        label: p.label,
        isDefault: p.isDefault,
      })),
    };
  }

  static toListResponse(
    rows: ProfileWithRole[],
    avatarUrls: Map<string, string>,
    coverUrls: Map<string, string>
  ): ProfileResponse[] {
    return rows.map((row) =>
      this.toResponse(
        row,
        row.avatarUrl ? avatarUrls.get(row.avatarUrl) || null : null,
        row.coverUrl ? coverUrls.get(row.coverUrl) || null : null
      )
    );
  }
}

export class AddressMapper {
  static toResponse(row: UserAddress): AddressResponse {
    return {
      id: row.id,
      profileId: row.profileId,
      label: row.label,
      line1: row.line1,
      line2: row.line2,
      city: row.city,
      state: row.state,
      countryCode: row.countryCode,
      postalCode: row.postalCode,
      isDefault: row.isDefault,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }

  static toListResponse(rows: UserAddress[]): AddressResponse[] {
    return rows.map((row) => this.toResponse(row));
  }
}
