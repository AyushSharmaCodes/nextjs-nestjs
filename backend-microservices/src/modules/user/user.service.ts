import { Injectable } from '@nestjs/common';
import { CreateProfileCommand } from './commands/create-profile.command';
import { UpdateProfileCommand } from './commands/update-profile.command';
import { DeactivateUserCommand } from './commands/deactivate-user.command';
import { AssignRoleCommand } from './commands/assign-role.command';
import { DeleteAddressCommand } from './commands/delete-address.command';
import { GetProfileQuery } from './queries/get-profile.query';
import { ListUsersQuery } from './queries/list-users.query';
import { GetUserAddressesQuery } from './queries/get-user-addresses.query';
import { CreateProfileDto } from './dto/create-profile.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { AssignRoleDto } from './dto/assign-role.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { CreateAddressDto, UpdateAddressDto } from './dto/create-address.dto';
import { UserRepository } from './user.repository';
import { UserNotFoundException } from './exceptions/user-not-found.exception';
import { UserStorageService } from './storage/user-storage.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { USER_EVENTS, AvatarUploadedEvent } from './events/user.events';
import { Profile, UserAddress, UserPhoneNumber } from '@prisma/client';

@Injectable()
export class UserService {
  constructor(
    private readonly createProfileCmd: CreateProfileCommand,
    private readonly updateProfileCmd: UpdateProfileCommand,
    private readonly deactivateUserCmd: DeactivateUserCommand,
    private readonly assignRoleCmd: AssignRoleCommand,
    private readonly deleteAddressCmd: DeleteAddressCommand,
    private readonly getProfileQuery: GetProfileQuery,
    private readonly listUsersQuery: ListUsersQuery,
    private readonly getUserAddressesQuery: GetUserAddressesQuery,
    private readonly repository: UserRepository,
    private readonly storage: UserStorageService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createProfile(userId: string, email: string, dto: CreateProfileDto) {
    return this.createProfileCmd.execute(userId, email, dto);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    return this.updateProfileCmd.execute(userId, dto);
  }

  async getProfile(userId: string) {
    return this.getProfileQuery.execute(userId);
  }

  async listUsers(query: PaginationQueryDto) {
    return this.listUsersQuery.execute(query);
  }

  async deactivateUser(targetUserId: string, adminUserId: string) {
    return this.deactivateUserCmd.execute(targetUserId, adminUserId);
  }

  async assignRole(targetUserId: string, adminUserId: string, dto: AssignRoleDto) {
    return this.assignRoleCmd.execute(targetUserId, adminUserId, dto);
  }

  async createAddress(userId: string, dto: CreateAddressDto) {
    const profile = await this.getProfile(userId);
    return this.repository.createAddress({
      profileId: profile.id,
      ...dto,
    });
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const profile = await this.getProfile(userId);
    const existing = await this.repository.getAddress(addressId, profile.id);
    if (!existing) {
      const { AddressNotFoundException } = await import('./exceptions/address-not-found.exception');
      throw new AddressNotFoundException();
    }

    return this.repository.updateAddress(addressId, dto, profile.id);
  }


  async deleteAddress(userId: string, addressId: string) {
    return this.deleteAddressCmd.execute(userId, addressId);
  }

  async listAddresses(userId: string): Promise<UserAddress[]> {
    return this.getUserAddressesQuery.execute(userId);
  }

  async addPhoneNumber(profileId: string, dto: { number: string; label?: string; isDefault?: boolean }): Promise<UserPhoneNumber> {
    return this.repository.addPhoneNumber({
      profileId,
      ...dto,
    });
  }

  async deletePhoneNumber(profileId: string, id: string): Promise<UserPhoneNumber> {
    const existing = await this.repository.getPhoneNumber(id);
    if (!existing || existing.profileId !== profileId) {
      throw new Error('Phone number not found or access denied');
    }
    return this.repository.deletePhoneNumber(id);
  }

  async uploadAvatar(userId: string, file: { buffer: Buffer; mimetype: string }) {
    const profile = await this.getProfile(userId);
    const ext = file.mimetype.split('/')[1];
    
    // Call storage service
    const path = await this.storage.uploadAvatar(userId, file.buffer, file.mimetype, ext);
    
    // Save to DB
    const updated = await this.repository.updateAvatarPath(profile.id, path);

    // Emit event
    this.eventEmitter.emit(
      USER_EVENTS.AVATAR_UPLOADED,
      new AvatarUploadedEvent(userId, 'user-avatars', path, new Date()),
    );

    return updated;
  }

  async removeAvatar(userId: string) {
    const profile = await this.getProfile(userId);
    await this.storage.removeAvatar(userId);
    return this.repository.updateAvatarPath(profile.id, null);
  }

  async uploadCover(userId: string, file: { buffer: Buffer; mimetype: string }) {
    const profile = await this.getProfile(userId);
    const ext = file.mimetype.split('/')[1];
    const path = await this.storage.uploadCover(userId, file.buffer, file.mimetype, ext);
    return this.repository.updateCoverPath(profile.id, path);
  }

  async removeCover(userId: string) {
    const profile = await this.getProfile(userId);
    await this.storage.removeCover(userId);
    return this.repository.updateCoverPath(profile.id, null);
  }

  async getSignedUrlForAvatar(path: string | null) {
    if (!path) return null;
    return this.storage.getSignedUrl('user-avatars', path);
  }

  async getSignedUrlForCover(path: string | null) {
    if (!path) return null;
    return this.storage.getSignedUrl('user-covers', path);
  }

  async getSignedUrlsInBulk(bucket: string, paths: string[]) {
    return this.storage.getSignedUrls(bucket, paths);
  }
}
