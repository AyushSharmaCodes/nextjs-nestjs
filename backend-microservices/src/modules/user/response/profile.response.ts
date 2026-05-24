export interface ProfileResponse {
  id: string;
  userId: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  gender: string | null;
  genderId: string | null;
  dob: string | null;
  nationality: string | null;
  nationalityCountryCode: string | null;
  preferredCurrency: string | null;
  emailNotification: boolean;
  /** Derived at query time via JOIN: phoneNumbers[default].country.phonecode */
  phoneCode: string | null;
  phoneCountryId: number | null;
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
    /** FK into countries table — use this to identify which dial-code country is selected */
    countryId: number | null;
    number: string;
    label: string;
    isDefault: boolean;
  }>;
}
