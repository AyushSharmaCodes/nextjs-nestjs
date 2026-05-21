import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/**
 * Restricts access to routes based on user roles (e.g., ADMIN, MANAGER).
 */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
