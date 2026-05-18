export type Role = 'USER' | 'ADMIN' | 'MANAGER';

export interface PersonalDetails {
  fullName: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other' | string;
  nationality: string;
  address: string;
  phone: string;
}

export interface AccountDetails {
  displayName: string;
  timeZone: string;
  createdAt?: string;
  lastLogin?: string;
  membershipStatus?: string;
}
