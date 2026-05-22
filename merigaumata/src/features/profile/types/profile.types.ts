export type Role = 'CUSTOMER' | 'ADMIN' | 'MANAGER';

export interface PersonalDetails {
  firstName: string;
  lastName: string;
  dob: string | null;
  gender: string | null;
  nationality: string | null;
  address: string;
  phone: string;
}

export interface AccountDetails {
  timeZone: string;
  createdAt?: string;
  lastLogin?: string;
}
