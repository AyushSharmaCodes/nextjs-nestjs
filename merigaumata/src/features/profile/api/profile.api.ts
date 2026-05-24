import { apiInstance } from '@/shared/lib/api/axios';
import { logger } from '@/shared/lib/logger';
import { PersonalDetails, AccountDetails, CountryOption, GenderOption } from '../types/profile.types';

interface ProfileApiEnvelope<T> {
  success: boolean;
  data: T;
}

interface PhoneNumberEntry {
  id: string;
  /** FK into countries table — identifies which dial-code country is selected */
  countryId: number | null;
  number: string;
  label: string;
  isDefault: boolean;
}

interface BackendProfile {
  firstName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  genderId?: string | null;
  dob?: string | null;
  nationality?: string | null;
  nationalityCountryCode?: string | null;
  preferredCurrency?: string | null;
  emailNotification?: boolean;
  /** Derived convenience field returned by the mapper (JOIN on country.phonecode) */
  phoneCode?: string | null;
  phoneCountryId?: number | null;
  locale?: string | null;
  timezone?: string | null;
  phone?: string | null;
  createdAt?: string;
  lastLoginAt?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  phoneNumbers?: PhoneNumberEntry[];
}

function unwrapProfile<T>(payload: T | ProfileApiEnvelope<T>): T {
  if (!payload) return payload as T;
  if (
    typeof payload === 'object' &&
    'success' in payload &&
    'data' in payload
  ) {
    return (payload as ProfileApiEnvelope<T>).data;
  }
  return payload as T;
}

function toPersonalDetails(profile: BackendProfile): PersonalDetails {
  logger.debug('[ProfileMapper] Mapping toPersonalDetails from:', { profile });
  if (!profile) {
    return {
      firstName: '',
      lastName: '',
      dob: null,
      gender: null,
      genderId: null,
      nationality: null,
      nationalityCountryCode: null,
      preferredCurrency: 'INR',
      emailNotification: true,
      phoneCountryId: null,
      address: '',
      phone: '',
    };
  }

  // Resolve the default phone number entry
  const defaultPhoneEntry =
    profile.phoneNumbers?.find(p => p.isDefault) ??
    profile.phoneNumbers?.[0] ??
    null;

  const phoneCountryId = defaultPhoneEntry?.countryId ?? profile.phoneCountryId ?? null;

  // The raw number stored in the DB may carry a country-code prefix if it was
  // saved that way historically. Strip it using the derived phoneCode hint so we
  // only keep the subscriber portion.
  const rawNumber = defaultPhoneEntry?.number ?? profile.phone ?? '';
  const phoneCodeHint = profile.phoneCode ?? ''; // e.g. "+91"
  const codeWithoutPlus = phoneCodeHint.startsWith('+') ? phoneCodeHint.substring(1) : phoneCodeHint;
  let cleanPhone = rawNumber;
  if (phoneCodeHint && rawNumber.startsWith(phoneCodeHint)) {
    cleanPhone = rawNumber.substring(phoneCodeHint.length).trim();
  } else if (codeWithoutPlus && rawNumber.startsWith(codeWithoutPlus)) {
    cleanPhone = rawNumber.substring(codeWithoutPlus.length).trim();
  }

  return {
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    dob: profile.dob ?? null,
    gender: profile.gender ?? null,
    genderId: profile.genderId ?? null,
    nationality: profile.nationality ?? null,
    nationalityCountryCode: profile.nationalityCountryCode ?? null,
    preferredCurrency: profile.preferredCurrency ?? 'INR',
    emailNotification: profile.emailNotification ?? true,
    phoneCountryId,
    address: '',
    phone: cleanPhone,
  };
}

function toAccountDetails(profile: BackendProfile): AccountDetails {
  if (!profile) {
    return { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone };
  }
  return {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    createdAt: profile.createdAt,
    lastLogin: profile.lastLoginAt || ({} as { val?: string }).val,
  };
}

async function fetchProfile(): Promise<BackendProfile> {
  const response = await apiInstance.get<BackendProfile | ProfileApiEnvelope<BackendProfile>>('/users/me');
  return unwrapProfile(response.data);
}

export const profileApi = {
  fetchPersonalDetails: async (): Promise<PersonalDetails> => {
    const profile = await fetchProfile();
    return toPersonalDetails(profile);
  },

  updatePersonalDetails: async (data: PersonalDetails): Promise<PersonalDetails> => {
    const response = await apiInstance.patch<BackendProfile | ProfileApiEnvelope<BackendProfile>>(
      '/users/me',
      {
        firstName: data.firstName,
        lastName: data.lastName,
        genderId: data.genderId,
        nationalityCountryCode: data.nationalityCountryCode,
        preferredCurrency: data.preferredCurrency,
        emailNotification: data.emailNotification,
        // Send country FK integer instead of raw phone code string
        phoneCountryId: data.phoneCountryId ?? ({} as { val?: number }).val,
        phone: data.phone,
        dob: data.dob,
      },
    );
    return toPersonalDetails(unwrapProfile(response.data));
  },

  fetchAccountDetails: async (): Promise<AccountDetails> => {
    const profile = await fetchProfile();
    return toAccountDetails(profile);
  },

  updateAccountDetails: async (data: AccountDetails): Promise<AccountDetails> => {
    const response = await apiInstance.patch<BackendProfile | ProfileApiEnvelope<BackendProfile>>(
      '/users/me',
      {},
    );
    return toAccountDetails(unwrapProfile(response.data));
  },

  fetchMedia: async (): Promise<{ avatarUrl: string | null; coverUrl: string | null }> => {
    const profile = await fetchProfile();
    return {
      avatarUrl: profile.avatarUrl ?? null,
      coverUrl: profile.coverUrl ?? null,
    };
  },

  uploadAvatar: async (file: File): Promise<BackendProfile> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiInstance.post<BackendProfile | ProfileApiEnvelope<BackendProfile>>(
      '/users/me/avatar',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return unwrapProfile(response.data);
  },

  removeAvatar: async (): Promise<BackendProfile> => {
    const response = await apiInstance.delete<BackendProfile | ProfileApiEnvelope<BackendProfile>>('/users/me/avatar');
    return unwrapProfile(response.data);
  },

  uploadCover: async (file: File): Promise<BackendProfile> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiInstance.post<BackendProfile | ProfileApiEnvelope<BackendProfile>>(
      '/users/me/cover',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return unwrapProfile(response.data);
  },

  removeCover: async (): Promise<BackendProfile> => {
    const response = await apiInstance.delete<BackendProfile | ProfileApiEnvelope<BackendProfile>>('/users/me/cover');
    return unwrapProfile(response.data);
  },

  fetchCountries: async (): Promise<CountryOption[]> => {
    const response = await apiInstance.get<{ success: boolean; data: CountryOption[] }>('/countries');
    return response.data.data;
  },

  fetchGenders: async (): Promise<GenderOption[]> => {
    const response = await apiInstance.get<{ success: boolean; data: GenderOption[] }>('/users/genders');
    return response.data.data;
  },
};

