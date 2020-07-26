import { Signale } from 'signale';

export const createLogger = (scope: string) => new Signale({ scope });

/**
 * TODO: use pino instead of signale
 * @param scope
 */
export function withLogging<T>(scope: string) {
  const log = createLogger(scope);

  const logger = async (fn: () => T | Promise<T>) => {
    log.await('[1/2]');

    try {
      const result = await fn();

      log.success('[2/2]');

      return result;
    } catch (err) {
      log.error('[2/2]');
      log.error(err);
      throw err;
    }
  };

  return logger;
}
