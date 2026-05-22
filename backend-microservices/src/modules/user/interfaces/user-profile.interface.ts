export interface IUserProfile {
  id: string;
  userId: string;
  roleId: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string | null;
  bio: string | null;
  locale: string;
  timezone: string;
  isActive: boolean;
  isVerified: boolean;
  avatarUrl: string | null;
  coverUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
}
