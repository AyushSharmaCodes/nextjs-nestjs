export type Role = 'CUSTOMER' | 'ADMIN' | 'MANAGER';

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  dob: string | null;
  gender: string | null;
  genderId?: string | null;
  nationality: string | null;
  nationalityCountryCode?: string | null;
  preferredCurrency?: string | null;
  emailNotification?: boolean;
  /**
   * The countries.id FK used to identify which country's dial-code applies
   * to this user's phone number.  Replaces the old free-text phoneCode string.
   */
  phoneCountryId?: number | null;
  address: string;
  phone: string;
}

export interface AccountDetails {
  timeZone: string;
  createdAt?: string;
  lastLogin?: string;
}

export interface CountryOption {
  id: number;
  name: string;
  iso2: string;
  phonecode: string | null;
  currency: string | null;
  emoji?: string | null;
}

export interface GenderOption {
  id: string;
  name: string;
}
