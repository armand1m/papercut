import pino from 'pino';

export interface CreateLoggerProps {
  name: pino.LoggerOptions['name'];
  enabled?: pino.LoggerOptions['enabled'];
}

export type Logger = pino.Logger;

export const createLogger = ({
  name,
  enabled,
}: CreateLoggerProps): Logger => {
  const logger = pino({
    name,
    enabled,
  });

  return logger;
};
