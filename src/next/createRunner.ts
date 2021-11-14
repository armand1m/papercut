import { DOMWindow, JSDOM } from 'jsdom';
import { pipe } from 'fp-ts/function';
import { fromNullable, match } from 'fp-ts/Option';

import { fetchPage } from '../fetchPage';
import { SelectorUtilities } from '../createSelectorUtilities';

import { scrape } from './scrape';
import { Logger } from './createLogger';
import { ScraperOptions } from './createScraper';

/**
 * Map of selector functions.
 *
 * This type is meant to be checked with an extended type,
 * as users are going to implement a derived version of this
 * for custom scrapers.
 */
export type SelectorMap = Record<string, SelectorFunction>;

export type SelectorFunction = (
  /**
   * Scraping utilities offered by papercut.
   */
  utils: SelectorUtilities,

  /**
   * A reference to the selector map in which
   * this selector function is being implemented.
   *
   * Handy when you want to reuse logic
   * from another selector.
   */
  self: SelectorMap
) => any;

export interface PaginationOptions {
  /**
   * Enables pagination.
   * @default false
   */
  enabled: boolean;

  /**
   * Function with custom logic to build
   * the paginated url for a specific page number.
   */
  createPaginatedUrl: (baseUrl: string, pageNumber: number) => string;

  /**
   * DOM selector to fetch the last page number
   * from the page being scraped.
   */
  lastPageNumberSelector: string;
}

export interface CreateRunnerProps {
  /**
   * A pino.Logger instance.
   */
  logger: Logger;
  /**
   * The scraper options.
   * Use this to tweak log, cache and concurrency settings.
   */
  options: ScraperOptions;
}

export interface RunProps<T extends SelectorMap, B extends boolean> {
  /**
   * If enabled, this will make Papercut scrape the page in strict mode.
   * This means that in case a selector function fails, the entire scraping will
   * be halted with an error.
   *
   * When enabled, the result types will **not** expect undefined values.
   */
  strict: B;

  /**
   * The base url to start scraping off.
   *
   * This page will be fetched, parsed and mounted in a virtual JSDOM instance.
   */
  baseUrl: string;

  /**
   * The DOM selector for the target nodes to be scraped.
   */
  target: string;

  /**
   * The selectors to be used during the scraping process.
   *
   * The result object will match the schema of the selectors.
   */
  selectors: T;

  /**
   * Optional pagination feature.
   *
   * If enabled and configured, this will make papercut
   * fetch, parse, mount and scrape multiple pages based
   * on a URL creation pattern.
   *
   * As long as you have a way to fetch the last page number
   * from the page you're scraping, and use it as a query param
   * in the page url, you should be fine.
   */
  pagination?: PaginationOptions;
}

/**
 * Creates a runner instance.
 *
 * This method is called by the createScraper function,
 * but can also be externally used if needed to use an
 * external pino logger or prefer full control over
 * the scraper options.
 *
 * @param props The runner logger and options.
 */
export const createRunner = ({
  logger,
  options,
}: CreateRunnerProps) => {
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
   *
   * @typeParam T A mapped type based on the given selectors.
   * @typeParam B The strict mode boolean type. Used to tweak the scrape result type strictness.
   * @param props The scraping runner properties and selectors.
   * @returns result Type-safe scraping results based on the given selectors and strict mode.
   */
  const run = async <T extends SelectorMap, B extends boolean>({
    strict,
    baseUrl,
    target,
    selectors,
  }: RunProps<T, B>) => {
    logger.info('Fetching...');

    const rawHTML = await fetchPage(baseUrl);

    logger.info('Parsing...');

    let window: DOMWindow | null = new JSDOM(rawHTML).window;
    let document: Document | null = window.document;

    logger.info('Scraping...');

    const results = await pipe(
      fromNullable(getLastPageNumberFromDocument(document)),
      match(
        async () => {
          logger.info(
            'Unable to find last page number. Scraping the main page only.'
          );

          if (document === null) {
            throw new Error(
              'Somehow the scraping started with a null document.'
            );
          }

          const mainPageResults = await scrape({
            strict,
            target,
            document,
            selectors,
            logger,
            options,
          });

          window?.close();
          window = null;
          document = null;

          return mainPageResults;
        },
        async (pageNumber) => {
          logger.info(`Found ${pageNumber} pages`);

          // TODO: implement paginated scraping

          return [];
        }
      )
    );

    return results;
  };

  return run;
};

const getLastPageNumberFromDocument = (
  _document: Document
): number | undefined => {
  return undefined;
};
