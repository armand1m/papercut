import { createLogger } from './createLogger';
import { createRunner } from './createRunner';

export interface ScraperProps {
  /**
   * The scraper name.
   * This will be used only for logging purposes.
   */
  name: string;
  /**
   * The scraper options.
   * Use this to tweak log, cache and concurrency settings.
   */
  options?: Partial<ScraperOptions>;
}

export interface ScraperOptions {
  /**
   * Enables writing pino logs to the stdout.
   * @default process.env.DEBUG === "true"
   */
  log: boolean;
  /**
   * Enables HTML payload caching on the disk.
   * Keep in mind that papercut **will not** clear the cache for you.
   * When enabling this, it's your responsability to deal with cache invalidation.
   *
   * @default false
   */
  cache: boolean;
  /**
   * Concurrency settings.
   */
  concurrency: {
    /**
     * Amount of concurrent promises for page scraping.
     * @default 2
     */
    page: number;
    /**
     * Amount of concurrent promises for node scraping.
     * @default 2
     */
    node: number;
    /**
     * Amount of concurrent promises for selector scraping.
     * @default 2
     */
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

/**
 * Creates a new scraper runner.
 *
 * This method is papercut entrypoint. It will create
 * an Scraper struct containing a runner that you can tweak
 * as needed.
 *
 * The runner is going to abide to the settings given
 * during the creation of this object.
 *
 * This function will also create a pino logger
 * and embed it within the runner.
 */
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

  /**
   * The scraper struct.
   */
  const scraper = {
    /**
     * The scraper runner.
     *
     * When executed, it will fetch the base url and
     * build a JSDOM using the received HTML payload
     * in order to make a virtual window and document
     * available for scraping.
     *
     * Once these are ready, the scraper will start to
     * spawn promise pools to deal with more intensive
     * tasks, such as pagination, node scraping and
     * selector scraping in parallel.
     *
     * All these settings will depend on the options given
     * during the creation of the scraper struct.
     */
    run: createRunner({
      logger,
      options,
    }),
  };

  return scraper;
};
