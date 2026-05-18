import { tokenVault } from '@/shared/lib/api/tokens';
import { profileApi } from '../api/profile.api';
import { PersonalDetails, AccountDetails, Role } from '../types/profile.types';
import { mockDefaultProfilePersonal, mockDefaultProfileAccount } from '@/mocks/userMocks';

// Dynamic mock flag using environment presence
const isProductionApi = typeof window !== 'undefined' && !!localStorage.getItem('auth_token');

export const profileService = {
  getUserRole: (): Role => {
    const role = tokenVault.getUserRole();
    if (role === 'ADMIN' || role === 'MANAGER' || role === 'USER') {
      return role as Role;
    }
    // Set default user role to USER if missing
    tokenVault.setUserRole('USER');
    return 'USER';
  },

  setUserRole: (role: Role): void => {
    tokenVault.setUserRole(role);
  },

  getPersonalDetails: async (): Promise<PersonalDetails> => {
    if (isProductionApi) {
      return profileApi.fetchPersonalDetails();
    }
    // Safely retrieve local details if running inside browser sandbox
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mgm_profile_personal');
      if (stored) return JSON.parse(stored) as PersonalDetails;
    }
    return mockDefaultProfilePersonal;
  },

  updatePersonalDetails: async (data: PersonalDetails): Promise<PersonalDetails> => {
    if (isProductionApi) {
      return profileApi.updatePersonalDetails(data);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('mgm_profile_personal', JSON.stringify(data));
    }
    return data;
  },

  getAccountDetails: async (): Promise<AccountDetails> => {
    if (isProductionApi) {
      return profileApi.fetchAccountDetails();
    }
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mgm_profile_account');
      if (stored) return JSON.parse(stored) as AccountDetails;
    }
    return mockDefaultProfileAccount;
  },

  updateAccountDetails: async (data: AccountDetails): Promise<AccountDetails> => {
    if (isProductionApi) {
      return profileApi.updateAccountDetails(data);
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem('mgm_profile_account', JSON.stringify(data));
    }
    return data;
  }
};
