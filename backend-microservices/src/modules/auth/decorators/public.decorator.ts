import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * Bypasses Global Authentication for this route.
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

/**
 * Legacy compatibility decorator for public routes.
 */
export const PublicRoute = () => SetMetadata(IS_PUBLIC_KEY, true);
