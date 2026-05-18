import { ManagerAccount } from '@/features/admin/types/admin.types';
import { PersonalDetails, AccountDetails } from '@/features/profile/types/profile.types';

export const mockDefaultManagers: ManagerAccount[] = [
  {
    id: '1',
    name: 'Gopal Krishna',
    email: 'manager@merigaumata.com',
    permissions: {
      events: true,
      products: true,
      welfare: true,
      donations: false
    },
    createdAt: '2026-01-01'
  }
];

export const mockDefaultProfilePersonal: PersonalDetails = {
  fullName: 'MockData.profile.defaultName',
  dob: '1987-01-01',
  gender: 'MockData.profile.defaultGender',
  nationality: 'MockData.profile.defaultNationality',
  address: 'MockData.profile.defaultAddress',
  phone: '+91 7898986744'
};

export const mockDefaultProfileAccount: AccountDetails = {
  displayName: 'MockData.profile.defaultName',
  timeZone: 'MockData.profile.defaultTimeZone'
};
