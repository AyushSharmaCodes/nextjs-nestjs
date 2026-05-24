import { UserAddress } from '@prisma/client';
import { ProfileResponse } from '../response/profile.response';
import { AddressResponse } from '../response/address.response';
import { ProfileWithRole, PhoneNumberWithCountry } from '../user.repository';

export class ProfileMapper {
  static toResponse(
    row: ProfileWithRole,
    signedAvatarUrl: string | null = null,
    signedCoverUrl: string | null = null
  ): ProfileResponse {
    // ── Derive phone code from the default phone number's joined country ───
    const defaultPhone = row.phoneNumbers.find(p => p.isDefault) ?? row.phoneNumbers[0] ?? null;
    const phoneCountryId = defaultPhone?.countryId ?? row.user?.nationalityCountry?.id ?? null;
    const rawPhoneCode = defaultPhone?.country?.phonecode ?? null;
    const phoneCode = rawPhoneCode
      ? rawPhoneCode.startsWith('+') ? rawPhoneCode : `+${rawPhoneCode}`
      : row.user?.nationalityCountry?.phonecode
        ? (row.user.nationalityCountry.phonecode.startsWith('+')
            ? row.user.nationalityCountry.phonecode
            : `+${row.user.nationalityCountry.phonecode}`)
        : null;

    return {
      id: row.id,
      userId: row.userId,
      role: row.role.name,
      firstName: row.firstName,
      lastName: row.lastName,
      gender: row.user?.genderRelation?.name || null,
      genderId: row.user?.genderRelation?.id || null,
      dob: row.user?.dob?.toISOString() || null,
      nationality: row.user?.nationalityCountry?.name || null,
      nationalityCountryCode: row.user?.nationalityCountry?.iso2 || null,
      preferredCurrency: row.user?.preferredCurrency || null,
      emailNotification: row.user?.emailNotification ?? true,
      phoneCode,
      phoneCountryId,
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
        countryId: p.countryId,
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
    return rows.map(row =>
      this.toResponse(
        row,
        row.avatarUrl ? avatarUrls.get(row.avatarUrl) || null : null,
        row.coverUrl ? coverUrls.get(row.coverUrl) || null : null,
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
    return rows.map(row => this.toResponse(row));
  }
}
