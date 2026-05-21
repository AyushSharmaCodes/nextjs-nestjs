/**
 * Barrel export for the env validation module.
 *
 * Usage:
 *   import { clientEnv } from '@/core/env'          // browser-safe vars
 *   import { serverEnv } from '@/core/env'          // server-only vars
 *   import type { ClientEnv, ServerEnv } from '@/core/env'
 */
export { clientEnv, env } from './client';
export { serverEnv } from './server';
export type { ClientEnv, ServerEnv } from './schema';
