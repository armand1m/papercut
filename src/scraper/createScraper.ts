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
 *
 * In case you prefer to manage the logger yourself,
 * please use `createRunner` instead.
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
    run: createRunner({
      logger,
      options,
    }),
  };

  return scraper;
};
