import PromisePool from '@supercharge/promise-pool';
import { Logger } from './createLogger';
import { SelectorMap } from './createRunner';
import { ScraperOptions } from './createScraper';

import { supress } from '../supress';
import { createSelectors, SelectorFnProps } from '../createSelectors';

interface ScrapeProps<T extends SelectorMap, B extends boolean> {
  strict: B;
  target: string;
  document: Document;
  selectors: T;
  logger: Logger;
  options: ScraperOptions;
}

export async function scrape<
  T extends SelectorMap,
  B extends boolean
>({
  strict,
  target,
  document,
  selectors,
  logger,
  options,
}: ScrapeProps<T, B>) {
  type ScrapeResultType = B extends true
    ? { [Prop in keyof T]: ReturnType<T[Prop]> }
    : { [Prop in keyof T]?: ReturnType<T[Prop]> };

  const nodes: Element[] = Array.prototype.slice.call(
    document.querySelectorAll(target)
  );

  type SelectorKey = keyof T;
  const selectorKeys = Object.keys(selectors) as SelectorKey[];

  /**
   * Higher order function that will create
   * a selector scraper based on the given
   * node selectors and selectors.
   */
  const createSelectorScraper = (
    nodeSelectors: SelectorFnProps
  ) => async (selectorKey: SelectorKey) => {
    const selectorFn = selectors[selectorKey];

    const selectorScrapedValue = strict
      ? await selectorFn(nodeSelectors, selectors)
      : await supress(
          () => selectorFn(nodeSelectors, selectors),
          error => logger.error(error)
        );

    return {
      [selectorKey]: selectorScrapedValue,
    } as ScrapeResultType;
  };

  /**
   * The node scraper
   *
   * This function will create the node selectors,
   * a selector scraper, and run the selector scraper
   * for each node using a Promise Pool.
   *
   * Concurrency can be controlled via papercut options.
   */
  const scrapeNode = async (node: Element) => {
    const nodeSelectors = createSelectors(node);

    const {
      results: scrapeResults,
    } = await PromisePool.withConcurrency(
      options.concurrency.selector
    )
      .for(selectorKeys)
      .process(createSelectorScraper(nodeSelectors));

    const nodeScrapeResult = scrapeResults.reduce(
      (accumulator, scrapeResult) => ({
        ...accumulator,
        ...scrapeResult,
      }),
      {} as ScrapeResultType
    );

    return nodeScrapeResult;
  };

  /**
   * Trigger node scrapers.
   * Concurrency can be configured using Papercut options.
   */
  const { results } = await PromisePool.withConcurrency(
    options.concurrency.node
  )
    .for(nodes)
    .process(scrapeNode);

  return results;
}
