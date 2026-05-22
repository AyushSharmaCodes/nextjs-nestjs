export interface ProfileResponse {
  id: string;
  userId: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
  dob: string | null;
  nationality: string | null;
  locale: string;
  timezone: string;
  isActive: boolean;
  isVerified: boolean;
  avatarUrl: string | null;
  coverUrl: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  phoneNumbers: Array<{
    id: string;
    number: string;
    label: string;
    isDefault: boolean;
  }>;
}
