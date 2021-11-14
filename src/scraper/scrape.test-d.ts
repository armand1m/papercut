import { expectType } from 'tsd';
import { Logger } from './createLogger';
import { defaultOptions } from './createScraper';
import { scrape } from './scrape';

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
  },
});

type ResultType = {
  foo: string;
  bar: 'bar';
  optional: string | null | undefined;
};

type ExpectedStrictResultType = Promise<ResultType[]>;
type ExpectedLooseResultType = Promise<Partial<ResultType>[]>;

expectType<ExpectedStrictResultType>(strictResult);
expectType<ExpectedLooseResultType>(looseResult);
