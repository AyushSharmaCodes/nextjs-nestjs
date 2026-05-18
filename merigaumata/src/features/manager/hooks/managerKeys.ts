export const managerKeys = {
  all: ['manager'] as const,
  profile: () => [...managerKeys.all, 'profile'] as const,
  events: () => [...managerKeys.all, 'events'] as const,
  products: () => [...managerKeys.all, 'products'] as const,
  donations: () => [...managerKeys.all, 'donations'] as const,
};
