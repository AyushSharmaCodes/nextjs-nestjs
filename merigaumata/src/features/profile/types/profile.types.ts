export type Role = 'CUSTOMER' | 'ADMIN' | 'MANAGER';

export interface PersonalDetails {
  firstName: string;
  lastName: string;
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
