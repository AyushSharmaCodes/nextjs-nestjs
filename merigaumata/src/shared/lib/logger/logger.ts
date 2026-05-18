import { getLogger } from '@logtape/logtape';

/**
 * Domain-Based Typesafe Loggers
 * 
 * Category hierarchy allows for sophisticated log routing and filtering:
 * - logger (['app']) -> general app logger
 * - authLogger (['app', 'auth']) -> authentication & session security events
 * - apiLogger (['app', 'api']) -> axios & network request telemetry
 * - paymentLogger (['app', 'payment']) -> payment transaction lifecycle
 * - checkoutLogger (['app', 'checkout']) -> cart, checkouts, and orders
 * - analyticsLogger (['app', 'analytics']) -> custom product & user metrics
 */

export const logger = getLogger(['app']);
export const authLogger = getLogger(['app', 'auth']);
export const apiLogger = getLogger(['app', 'api']);
export const paymentLogger = getLogger(['app', 'payment']);
export const checkoutLogger = getLogger(['app', 'checkout']);
export const analyticsLogger = getLogger(['app', 'analytics']);
