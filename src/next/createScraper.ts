import { createLogger } from './createLogger';
import { createRunner } from './createRunner';

export interface ScraperProps {
  name: string;
  options?: Partial<ScraperOptions>;
}

export interface ScraperOptions {
  log: boolean;
  cache: boolean;
  concurrency: {
    page: number;
    node: number;
    selector: number;
  };
}

export interface PaginationOptions {
  createPaginatedUrl: (
    metadata: ScraperProps,
    pageNumber: number
  ) => string;
  lastPageNumberSelector: string;
}

export const defaultOptions: ScraperOptions = {
  log: process.env.DEBUG === 'true',
  cache: false,
  concurrency: {
    page: 2,
    node: 2,
    selector: 2,
  },
};

export type Scraper = ReturnType<typeof createScraper>;

export const createScraper = (props: ScraperProps) => {
  const options: ScraperOptions = {
    ...defaultOptions,
    ...props.options,
    concurrency: {
      ...defaultOptions.concurrency,
      ...props.options?.concurrency,
    },
  };

  const logger = createLogger({
    name: props.name,
    enabled: options.log,
  });

  return {
    run: createRunner({
      logger,
      options,
    }),
  };
};
