import { DOMWindow, JSDOM } from 'jsdom';
import { pipe } from 'fp-ts/function';
import { fromNullable, match } from 'fp-ts/Option';

import { fetchPage } from '../fetchPage';
import { SelectorFnProps } from '../createSelectors';

import { scrape } from './scrape';
import { Logger } from './createLogger';
import { ScraperOptions } from './createScraper';

export type SelectorMap = Record<
  string,
  (selectors: SelectorFnProps, $this: SelectorMap) => any
>;

export type SelectorFn = (
  props: SelectorFnProps,
  $this: SelectorMap
) => any;

export interface CreateRunnerProps {
  logger: Logger;
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
}

export const createRunner = ({
  logger,
  options,
}: CreateRunnerProps) => {
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
        async pageNumber => {
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
