import { logger } from '../logger';

/**
 * Executes a function and measures its execution latency, automatically logging the result.
 * Supports both synchronous and asynchronous operations.
 * 
 * @param label Human-readable description of the operation (e.g. "fetchProductsFromDatabase")
 * @param callback Synchronous or Asynchronous function to execute
 * @param thresholdMs Slow operation warning threshold (defaults to 1000ms)
 */
export function tracePerformance<T>(
  label: string,
  callback: () => T,
  thresholdMs = 1000
): T {
  const start = performance.now();
  
  const logResult = (duration: number, errorStatus = false) => {
    const roundedDuration = Math.round(duration * 100) / 100;
    const isSlow = roundedDuration >= thresholdMs;

    const logData = {
      operation: label,
      durationMs: roundedDuration,
      slow: isSlow,
      error: errorStatus,
    };

    if (isSlow) {
      logger.warn(`🐢 Slow operation detected: ${label} took {durationMs}ms`, logData);
    } else {
      logger.debug(`⏱️ Operation ${label} completed in {durationMs}ms`, logData);
    }
  };

  try {
    const result = callback();

    if (result instanceof Promise) {
      return result
        .then((resolved) => {
          logResult(performance.now() - start, false);
          return resolved;
        })
        .catch((err) => {
          logResult(performance.now() - start, true);
          throw err;
        }) as unknown as T;
    }

    logResult(performance.now() - start, false);
    return result;
  } catch (err) {
    logResult(performance.now() - start, true);
    throw err;
  }
}
