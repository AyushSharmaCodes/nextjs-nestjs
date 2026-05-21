import { apiInstance } from '@/shared/lib/api/axios';
import { PersonalDetails, AccountDetails } from '../types/profile.types';

interface ProfileApiEnvelope<T> {
  success: boolean;
  data: T;
}

interface BackendProfile {
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  createdAt?: string;
  preferences?: Record<string, unknown> | null;
}

function unwrapProfile<T>(payload: T | ProfileApiEnvelope<T>): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'success' in payload &&
    'data' in payload
  ) {
    return (payload as ProfileApiEnvelope<T>).data;
  }
  return payload as T;
}

function readPreferenceString(
  prefs: Record<string, unknown> | null | undefined,
  key: string,
): string {
  const raw = prefs?.[key];
  return typeof raw === 'string' ? raw : '';
}

function toPersonalDetails(profile: BackendProfile): PersonalDetails {
  const prefs = profile.preferences ?? {};
  return {
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    dob: readPreferenceString(prefs, 'dob'),
    gender: readPreferenceString(prefs, 'gender'),
    nationality: readPreferenceString(prefs, 'nationality'),
    address: readPreferenceString(prefs, 'address'),
    phone: profile.phone ?? '',
  };
}

function toAccountDetails(profile: BackendProfile): AccountDetails {
  const prefs = profile.preferences ?? {};
  const fallbackDisplayName = `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
  return {
    displayName: readPreferenceString(prefs, 'displayName') || fallbackDisplayName,
    timeZone: readPreferenceString(prefs, 'timeZone') || 'Asia/Kolkata',
    createdAt: profile.createdAt,
  };
}

async function fetchProfile(): Promise<BackendProfile> {
  const response = await apiInstance.get<BackendProfile | ProfileApiEnvelope<BackendProfile>>('/profile');
  return unwrapProfile(response.data);
}

async function mergePreferences(
  incoming: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const current = await fetchProfile();
  const currentPrefs = current.preferences && typeof current.preferences === 'object'
    ? current.preferences
    : {};
  return {
    ...currentPrefs,
    ...incoming,
  };
}

export const profileApi = {
  fetchPersonalDetails: async (): Promise<PersonalDetails> => {
    const profile = await fetchProfile();
    return toPersonalDetails(profile);
  },

  updatePersonalDetails: async (data: PersonalDetails): Promise<PersonalDetails> => {
    const preferences = await mergePreferences({
      dob: data.dob,
      gender: data.gender,
      nationality: data.nationality,
      address: data.address,
    });
    const response = await apiInstance.put<BackendProfile | ProfileApiEnvelope<BackendProfile>>('/profile', {
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      preferences,
    });
    return toPersonalDetails(unwrapProfile(response.data));
  },

  fetchAccountDetails: async (): Promise<AccountDetails> => {
    const profile = await fetchProfile();
    return toAccountDetails(profile);
  },

  updateAccountDetails: async (data: AccountDetails): Promise<AccountDetails> => {
    const preferences = await mergePreferences({
      displayName: data.displayName,
      timeZone: data.timeZone,
    });
    const response = await apiInstance.put<BackendProfile | ProfileApiEnvelope<BackendProfile>>('/profile', {
      preferences,
    });
    return toAccountDetails(unwrapProfile(response.data));
  }
};
