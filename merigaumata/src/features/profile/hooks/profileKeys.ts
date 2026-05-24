export const profileKeys = {
  all: ['profile'] as const,
  role: () => [...profileKeys.all, 'role'] as const,
  personal: () => [...profileKeys.all, 'personal'] as const,
  account: () => [...profileKeys.all, 'account'] as const,
  media: () => [...profileKeys.all, 'media'] as const,
  countries: () => [...profileKeys.all, 'countries'] as const,
  genders: () => [...profileKeys.all, 'genders'] as const,
};

