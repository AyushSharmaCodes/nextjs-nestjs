import { apiInstance } from '@/shared/lib/api/axios';
import { PersonalDetails, AccountDetails } from '../types/profile.types';

interface ProfileApiEnvelope<T> {
  success: boolean;
  data: T;
}

interface BackendProfile {
  firstName?: string | null;
  lastName?: string | null;
  gender?: string | null;
  dob?: string | null;
  nationality?: string | null;
  locale?: string | null;
  timezone?: string | null;
  phone?: string | null;
  createdAt?: string;
  lastLoginAt?: string | null;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  phoneNumbers?: Array<{
    id: string;
    number: string;
    label: string;
    isDefault: boolean;
  }>;
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
  console.debug('[ProfileMapper] Mapping toPersonalDetails from:', profile);
  if (!profile) {
    return {
      firstName: '',
      lastName: '',
      dob: null,
      gender: null,
      nationality: null,
      address: '',
      phone: '',
    };
  }

  const defaultPhone = profile.phoneNumbers?.find(p => p.isDefault)?.number 
    || profile.phoneNumbers?.[0]?.number 
    || profile.phone 
    || '';

  return {
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    dob: profile.dob ?? null,
    gender: profile.gender ?? null,
    nationality: profile.nationality ?? null,
    address: 'Sector 45, Gurugram - India', 
    phone: defaultPhone,
  };
}

function toAccountDetails(profile: BackendProfile): AccountDetails {
  if (!profile) {
    return {
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  return {
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    createdAt: profile.createdAt,
    lastLogin: profile.lastLoginAt || undefined,
  };
}

async function fetchProfile(): Promise<BackendProfile> {
  // Backend UserController is mounted at /users — correct endpoint is /users/me
  const response = await apiInstance.get<BackendProfile | ProfileApiEnvelope<BackendProfile>>('/users/me');
  return unwrapProfile(response.data);
}

export const profileApi = {
  fetchPersonalDetails: async (): Promise<PersonalDetails> => {
    const profile = await fetchProfile();
    return toPersonalDetails(profile);
  },

  updatePersonalDetails: async (data: PersonalDetails): Promise<PersonalDetails> => {
    // PATCH /users/me — send fields that belong to User/Profile
    const response = await apiInstance.patch<BackendProfile | ProfileApiEnvelope<BackendProfile>>(
      '/users/me',
      {
        firstName: data.firstName,
        lastName: data.lastName,
        gender: data.gender,
        dob: data.dob,
        nationality: data.nationality,
      },
    );
    return toPersonalDetails(unwrapProfile(response.data));
  },

  fetchAccountDetails: async (): Promise<AccountDetails> => {
    const profile = await fetchProfile();
    return toAccountDetails(profile);
  },

  updateAccountDetails: async (data: AccountDetails): Promise<AccountDetails> => {
    // PATCH /users/me — empty payload for now if only timezone was there, 
    // but the backend controller might still handle other Profile fields.
    const response = await apiInstance.patch<BackendProfile | ProfileApiEnvelope<BackendProfile>>(
      '/users/me',
      {
        // No fields to update for now in AccountDetails since timezone is local-only
      },
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
      { headers: { 'Content-Type': 'multipart/form-data' } }
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
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return unwrapProfile(response.data);
  },

  removeCover: async (): Promise<BackendProfile> => {
    const response = await apiInstance.delete<BackendProfile | ProfileApiEnvelope<BackendProfile>>('/users/me/cover');
    return unwrapProfile(response.data);
  },
};
