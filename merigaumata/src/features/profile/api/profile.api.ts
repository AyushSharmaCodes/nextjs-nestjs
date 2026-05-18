import { apiInstance } from '@/shared/lib/api/axios';
import { PersonalDetails, AccountDetails } from '../types/profile.types';

export const profileApi = {
  fetchPersonalDetails: async (): Promise<PersonalDetails> => {
    const response = await apiInstance.get<PersonalDetails>('/profile/personal');
    return response.data;
  },

  updatePersonalDetails: async (data: PersonalDetails): Promise<PersonalDetails> => {
    const response = await apiInstance.put<PersonalDetails>('/profile/personal', data);
    return response.data;
  },

  fetchAccountDetails: async (): Promise<AccountDetails> => {
    const response = await apiInstance.get<AccountDetails>('/profile/account');
    return response.data;
  },

  updateAccountDetails: async (data: AccountDetails): Promise<AccountDetails> => {
    const response = await apiInstance.put<AccountDetails>('/profile/account', data);
    return response.data;
  }
};
