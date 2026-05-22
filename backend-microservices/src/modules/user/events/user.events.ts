export class UserCreatedEvent {
  constructor(
    public readonly userId: string,
    public readonly role: string,
    public readonly locale: string,
    public readonly createdAt: Date,
  ) {}
}

export class UserUpdatedEvent {
  constructor(
    public readonly userId: string,
    public readonly changedFields: string[],
    public readonly updatedAt: Date,
  ) {}
}

export class UserDeactivatedEvent {
  constructor(
    public readonly userId: string,
    public readonly deactivatedBy: string,
    public readonly reason: string,
    public readonly deactivatedAt: Date,
  ) {}
}

export class RoleChangedEvent {
  constructor(
    public readonly userId: string,
    public readonly oldRole: string,
    public readonly newRole: string,
    public readonly changedBy: string,
  ) {}
}

export class AvatarUploadedEvent {
  constructor(
    public readonly userId: string,
    public readonly bucket: string,
    public readonly path: string,
    public readonly uploadedAt: Date,
  ) {}
}

export const USER_EVENTS = {
  CREATED: 'user.created',
  UPDATED: 'user.updated',
  DEACTIVATED: 'user.deactivated',
  ROLE_CHANGED: 'user.role_changed',
  AVATAR_UPLOADED: 'user.avatar_uploaded',
} as const;
