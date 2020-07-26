import { JSDOM } from 'jsdom';
import range from 'lodash/range';
import { createLogger } from './logger';
import { fetchPage } from './fetchPage';
import { supress } from './supress';
import { createSelectors } from './createSelectors';
import { flat } from './flat';

export interface ScraperProps {
  name: string;
  baseUrl: string;
}

export interface ScraperOptions {
  log: boolean;
  cache: boolean;
}

export interface PaginationOptions {
  createPaginatedUrl: (metadata: ScraperProps, pageNumber: number) => string;
  lastPageNumberSelector: string;
}

interface SelectorFnProps {
  attr: (selector: string, attribute: string) => string | undefined;
  text: (selector: string) => string | undefined;
  href: (selector: string) => string | undefined;
  src: (selector: string) => string | undefined;
  geosearch: (address: string) => Promise<string | undefined>;
  className: (selector: string) => string | undefined;
  element: Element;
}

type SelectorFn = (props: SelectorFnProps, $this: SelectorMap) => any;

export type SelectorMap = Record<string, SelectorFn>;

export class Scraper {
  private props: ScraperProps;
  private options: ScraperOptions;
  private selectors: SelectorMap = {};
  private paginationOptions: PaginationOptions | undefined;
  private forEachSelector: string | undefined;
  private log: any;

  constructor(props: ScraperProps, options: ScraperOptions) {
    this.props = props;
    this.options = options;

    const logger = createLogger(this.props.name);
    const log = this.options.log
      ? logger
      : {
          await: () => {
            /** noop */
          },
          error: () => {
            /** noop */
          },
          info: () => {
            /** noop */
          },
        };

    this.log = log;
  }

  public forEach(selector: string) {
    this.forEachSelector = selector;
    return this;
  }

  public createSelectors(selectors: SelectorMap) {
    this.selectors = selectors;
    return this;
  }

  public usePagination(paginationConfig: PaginationOptions) {
    this.paginationOptions = paginationConfig;
    return this;
  }

  private getPageNumbers(document: Document) {
    if (!this.paginationOptions) {
      return undefined;
    }

    this.log.info(`Pagination is enabled. Trying to find last page number..`);

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
      throw new Error('A .forEach(selector: string) is needed to loop into.');
    }

    const nodes = document.querySelectorAll(this.forEachSelector);
    const nodesArray = Array.prototype.slice.call(nodes) as Element[];

    const results = [];

    for (const node of nodesArray) {
      const nodeSelectors = createSelectors(node);
      const selectorKeys = Object.keys(this.selectors);
      const nodeScrapeResult = {} as Record<string, string>;

      for (const selectorKey of selectorKeys) {
        const selector = this.selectors[selectorKey];
        const selectorResult = await supress(
          () => selector(nodeSelectors, this.selectors),
          err => this.log.error(err)
        );

        nodeScrapeResult[selectorKey] = selectorResult;
      }

      results.push(nodeScrapeResult);
    }

    return results;
  }

  public async run() {
    if (!this.forEachSelector) {
      throw new Error('A .forEach(selector: string) is needed to loop into.');
    }

    if (Object.keys(this.selectors).length === 0) {
      throw new Error('No selectors are defined.');
    }

    this.log.await('Fetching..');

    const payload = await fetchPage(this.props.baseUrl);

    this.log.await('Parsing..');

    const { document } = new JSDOM(payload).window;

    const pageNumbers = this.getPageNumbers(document);

    this.log.await('Scraping..');

    if (pageNumbers) {
      const createPaginatedUrl = this.paginationOptions?.createPaginatedUrl;

      if (!createPaginatedUrl) {
        throw new Error('Please define a function to build a paginated url.');
      }

      const scrapePromises = pageNumbers.map(async pageNumber => {
        this.log.await(`Fetching page ${pageNumber}`);

        const payload = await fetchPage(
          createPaginatedUrl(this.props, pageNumber)
        );

        this.log.await(`Parsing page ${pageNumber}`);

        const { document: pageDocument } = new JSDOM(payload).window;

        this.log.await(`Scraping page ${pageNumber}`);

        const pageResult = await this.scrape(pageDocument);

        return pageResult;
      });

      const unflattedResults = await Promise.all(scrapePromises);
      const flatResults = flat(unflattedResults);

      return flatResults;
    } else {
      const mainPageResults = await this.scrape(document);
      return mainPageResults;
    }
  }
}
