export const managerKeys = {
  all: ['manager'] as const,
  // Include email in the key so the cache is scoped per user session.
  // When the session changes (different user logs in), the cache is invalidated.
  profile: (email?: string) => [...managerKeys.all, 'profile', email ?? 'anonymous'] as const,
  events: () => [...managerKeys.all, 'events'] as const,
  products: () => [...managerKeys.all, 'products'] as const,
  donations: () => [...managerKeys.all, 'donations'] as const,
};
