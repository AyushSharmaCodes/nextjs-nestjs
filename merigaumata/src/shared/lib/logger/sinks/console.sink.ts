import { getConsoleSink } from '@logtape/logtape';

/**
 * Creates and returns the console sink.
 * 
 * In development, we use non-blocking colored terminal logs.
 * In production, we can format output as standardized JSON-lines if desired, 
 * or use the robust default console outputs which avoid blocking the main thread.
 */
export function createConsoleSink() {
  // process.env.NODE_ENV is a compile-time constant inlined by Next.js — safe on all runtimes
  const isProduction = process.env.NODE_ENV === 'production';


  return getConsoleSink({
    // In production, buffer console outputs and flush asynchronously to maximize rendering/event-loop performance.
    nonBlocking: isProduction,
  });
}
