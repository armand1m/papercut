import { expectType } from 'tsd';
import { scrape } from './scrape';
import { Logger } from './createLogger';
import { defaultOptions } from './createScraper';

const strictResult = scrape({
  strict: true,
  document: {} as Document,
  target: '.demo',
  logger: {} as Logger,
  options: defaultOptions,
  selectors: {
    foo: ({ text }) => text('.foo'),
    bar: () => 'bar' as const,
    optional: ({ element }) =>
      element.nextElementSibling?.textContent,
    asyncValue: async ({ text }) => {
      await Promise.resolve();
      return text('.async');
    },
  },
});

const looseResult = scrape({
  strict: false,
  document: {} as Document,
  target: '.demo',
  logger: {} as Logger,
  options: defaultOptions,
  selectors: {
    foo: ({ text }) => text('.foo'),
    bar: () => 'bar' as const,
    optional: ({ element }) =>
      element.nextElementSibling?.textContent,
    asyncValue: async ({ text }) => {
      await Promise.resolve();
      return text('.async');
    },
  },
});

type ResultType = {
  foo: string;
  bar: 'bar';
  optional: string | null | undefined;
  asyncValue: string;
};

type ExpectedStrictResultType = Promise<ResultType[]>;
type ExpectedLooseResultType = Promise<Partial<ResultType>[]>;

expectType<ExpectedStrictResultType>(strictResult);
expectType<ExpectedLooseResultType>(looseResult);
