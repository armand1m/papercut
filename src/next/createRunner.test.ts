import { createRunner } from './createRunner';
import { defaultOptions } from './createScraper';

const mockLogger = jest.fn() as jest.Mock<any>;

test('createRunner', () => {
  const runner = createRunner({
    logger: mockLogger as any,
    options: defaultOptions,
  });

  expect(runner).toBeDefined();
});

test('runner scrapes and returns values properly', async () => {
  const runner = createRunner({
    logger: mockLogger as any,
    options: {
      ...defaultOptions,
      log: false,
      cache: true,
    },
  });

  const results = await runner({
    strict: true,
    baseUrl: 'http://localhost',
    target: '.test',
    selectors: {
      testValue: ({ text }) => {
        const value = text('.test-text');
        return `${value}`;
      },
    },
  });

  expect(results).toBe([
    {
      testValue: 'some test text',
    },
  ]);
});
