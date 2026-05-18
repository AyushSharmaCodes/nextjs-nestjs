export const adminKeys = {
  all: ['admin'] as const,
  managers: () => [...adminKeys.all, 'managers'] as const,
};
