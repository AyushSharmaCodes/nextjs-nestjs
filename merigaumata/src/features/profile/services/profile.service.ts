import { profileApi } from '../api/profile.api';
import { PersonalDetails, AccountDetails, CountryOption, GenderOption } from '../types/profile.types';

export const profileService = {
  getPersonalDetails: async (): Promise<PersonalDetails> => {
    return await profileApi.fetchPersonalDetails();
  },

  updatePersonalDetails: async (data: PersonalDetails): Promise<PersonalDetails> => {
    return await profileApi.updatePersonalDetails(data);
  },

  getAccountDetails: async (): Promise<AccountDetails> => {
    return await profileApi.fetchAccountDetails();
  },

  updateAccountDetails: async (data: AccountDetails): Promise<AccountDetails> => {
    return await profileApi.updateAccountDetails(data);
  },

  getMedia: async () => {
    return await profileApi.fetchMedia();
  },

  uploadAvatar: async (file: File) => {
    return await profileApi.uploadAvatar(file);
  },

  removeAvatar: async () => {
    return await profileApi.removeAvatar();
  },

  uploadCover: async (file: File) => {
    return await profileApi.uploadCover(file);
  },

  removeCover: async () => {
    return await profileApi.removeCover();
  },

  getCountries: async (): Promise<CountryOption[]> => {
    return await profileApi.fetchCountries();
  },

  getGenders: async (): Promise<GenderOption[]> => {
    return await profileApi.fetchGenders();
  },
};
