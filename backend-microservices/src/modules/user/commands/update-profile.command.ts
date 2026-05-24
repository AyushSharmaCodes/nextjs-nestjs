import { Injectable } from '@nestjs/common';
import { UserRepository, ProfileWithRole } from '../user.repository';
import { UpdateProfileDto } from '../dto/update-profile.dto';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { USER_EVENTS, UserUpdatedEvent } from '../events/user.events';
import { UserNotFoundException } from '../exceptions/user-not-found.exception';

@Injectable()
export class UpdateProfileCommand {
  constructor(
    private readonly repository: UserRepository,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(userId: string, dto: UpdateProfileDto): Promise<ProfileWithRole> {
    const profile = await this.repository.findProfileByUserId(userId);
    if (!profile) {
      throw new UserNotFoundException();
    }

    // ── Phone number upsert ──────────────────────────────────────────────────
    // Upsert the default phone number, carrying the country FK for dial-code derivation.
    if (dto.phone !== undefined) {
      await this.repository.upsertDefaultPhoneNumber(
        profile.id,
        dto.phone,
        dto.phoneCountryId, // may be undefined (no change) or a valid country id
      );
    } else if (dto.phoneCountryId !== undefined) {
      // Country changed but phone number text stayed the same — update country FK only.
      await this.repository.updatePhoneNumberCountry(profile.id, dto.phoneCountryId);
    }

    // ── Profile / User fields update ─────────────────────────────────────────
    const updated = await this.repository.updateProfile(profile.id, {
      firstName: dto.firstName,
      lastName: dto.lastName,
      locale: dto.locale,
      timezone: dto.timezone,
      user: {
        update: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          genderId: dto.genderId,
          nationalityCountryCode: dto.nationalityCountryCode,
          preferredCurrency: dto.preferredCurrency,
          emailNotification: dto.emailNotification,
          dob: dto.dob ? new Date(dto.dob) : undefined,
        },
      },
    });

    const changedFields = Object.keys(dto);
    if (changedFields.length > 0) {
      this.eventEmitter.emit(
        USER_EVENTS.UPDATED,
        new UserUpdatedEvent(updated.userId, changedFields, updated.updatedAt),
      );
    }

    return updated;
  }
}
