import { DOMWindow, JSDOM } from 'jsdom';
import PromisePool from '@supercharge/promise-pool';
import range from 'lodash/range';
import { Signale } from 'signale';
import { createLogger } from './logger';
import { fetchPage } from '../http/fetchPage';
import { supress } from '../utilities/supress';
import {
  createSelectorUtilities,
  SelectorUtilities,
} from '../utilities/createSelectorUtilities';
import { flat } from '../utilities/flat';

export interface ScraperProps {
  name: string;
  baseUrl: string;
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

type SelectorFn = (
  props: SelectorUtilities,
  $this: SelectorMap
) => string | number | object;

export type SelectorMap = Record<string, SelectorFn>;

export class Scraper {
  private props: ScraperProps;
  private options: ScraperOptions;
  private selectors: SelectorMap = {};
  private paginationOptions: PaginationOptions | undefined;
  private forEachSelector: string | undefined;
  private log: Signale;

  constructor(
    props: ScraperProps,
    options?: Partial<ScraperOptions>
  ) {
    this.props = props;
    this.options = {
      log: process.env.DEBUG === 'true',
      cache: false,
      concurrency: {
        page: 2,
        node: 2,
        selector: 2,
        ...options?.concurrency,
      },
      ...options,
    };

    this.log = this.options.log
      ? createLogger(this.props.name)
      : ({
          await: () => {
            /** noop */
          },
          error: () => {
            /** noop */
          },
          info: () => {
            /** noop */
          },
        } as Signale);
  }

  public forEach(selector: string) {
    this.forEachSelector = selector;
    return this;
  }

  public createSelectors(selectors: SelectorMap) {
    this.selectors = selectors;
    return this;
  }

  public usePagination(paginationOptions: PaginationOptions) {
    this.paginationOptions = paginationOptions;
    return this;
  }

  private getPageNumbers(document: Document) {
    if (!this.paginationOptions) {
      return undefined;
    }

    this.log.info(
      `Pagination is enabled. Trying to find last page number..`
    );

    const lastPageNumberElement = document.querySelector(
      this.paginationOptions.lastPageNumberSelector
    );

    if (!lastPageNumberElement) {
      throw new Error(
        `Failed to fetch page count, cannot scrape with pagination. Aborted.`
      );
    }

    const lastPageNumber = lastPageNumberElement.textContent;

    this.log.info(`Got ${lastPageNumber} pages to scrape.`);

    return range(1, Number(lastPageNumber));
  }

  private async scrape(document: Document) {
    if (!this.forEachSelector) {
      throw new Error(
        'A .forEach(selector: string) is needed to loop into.'
      );
    }

    const nodes = document.querySelectorAll(this.forEachSelector);
    const nodesArray = Array.prototype.slice.call(nodes) as Element[];

    const { results } = await PromisePool.withConcurrency(
      this.options.concurrency.node
    )
      .for(nodesArray)
      .process(async (node) => {
        const nodeSelectors = createSelectorUtilities(node);
        const selectorKeys = Object.keys(this.selectors);
        const { results: nodeScrapeResultArray } =
          await PromisePool.withConcurrency(
            this.options.concurrency.selector
          )
            .for(selectorKeys)
            .process(async (selectorKey) => {
              const selector = this.selectors[selectorKey];
              const selectorResult = await supress(
                () => selector(nodeSelectors, this.selectors),
                (err) => this.log.error(err)
              );

              return {
                [selectorKey]: selectorResult,
              };
            });

        const nodeScrapeResult = nodeScrapeResultArray.reduce(
          (acc, scrapeResult) => {
            return {
              ...acc,
              ...scrapeResult,
            };
          },
          {}
        );

        return nodeScrapeResult;
      });

    return results;
  }

  public async run() {
    if (!this.forEachSelector) {
      throw new Error(
        'A .forEach(selector: string) is needed to loop into.'
      );
    }

    if (Object.keys(this.selectors).length === 0) {
      throw new Error('No selectors are defined.');
    }

    this.log.await('Fetching..');

    let payload: string | null = await fetchPage(this.props.baseUrl);

    this.log.await('Parsing..');

    let window: DOMWindow | null = new JSDOM(payload).window;
    let document: Document | null = window.document;

    const pageNumbers = this.getPageNumbers(document);

    this.log.await('Scraping..');

    if (pageNumbers) {
      const createPaginatedUrl =
        this.paginationOptions?.createPaginatedUrl;

      if (!createPaginatedUrl) {
        throw new Error(
          'Please define a function to build a paginated url.'
        );
      }

      const { results, errors } = await PromisePool.withConcurrency(
        this.options.concurrency.page
      )
        .for(pageNumbers)
        .process(async (pageNumber: number) => {
          this.log.await(`Fetching page ${pageNumber}`);

          let pagePayload: string | null = await fetchPage(
            createPaginatedUrl(this.props, pageNumber)
          );

          this.log.await(`Parsing page ${pageNumber}`);

          let pageWindow: DOMWindow | null = new JSDOM(pagePayload)
            .window;
          let pageDocument: Document | null = pageWindow.document;

          this.log.await(`Scraping page ${pageNumber}`);

          const pageResult = await this.scrape(pageDocument);

          pageWindow.close();
          pageWindow = null;
          pagePayload = null;
          pageDocument = null;

          return pageResult;
        });

      if (errors) {
        this.log.error('Some scraping requests failed with errors.');
        this.log.error(errors);
      }

      const flatResults = flat(results);

      window.close();
      window = null;
      document = null;
      payload = null;

      return flatResults;
    } else {
      const mainPageResults = await this.scrape(document);

      window.close();
      window = null;
      document = null;
      payload = null;

      return mainPageResults;
    }
  }
}
