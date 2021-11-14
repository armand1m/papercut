import path from 'path';

import { createScraper } from './createScraper';
process.env.PAPERCUT_PAGE_CACHE_PATH = path.resolve(
  __dirname,
  './__fixtures__/pagecache'
);

test('createScraper', async () => {
  const scraper = createScraper({
    name: `Hacker News`,
    options: {
      log: false,
      cache: true,
    },
  });

  const results = await scraper.run({
    strict: true,
    baseUrl: 'https://news.ycombinator.com/',
    target: '.athing',
    selectors: {
      rank: (utils) => {
        const value = utils.text('.rank').replace(/^\D+/g, '');
        return Number(value);
      },
      name: ({ text }) => text('.titlelink'),
      url: ({ href }) => href('.titlelink'),
      score: ({ element }) => {
        return element.nextElementSibling?.querySelector('.score')
          ?.textContent;
      },
      createdBy: ({ element }) => {
        return element.nextElementSibling?.querySelector('.hnuser')
          ?.textContent;
      },
      createdAt: ({ element }) => {
        return element.nextElementSibling
          ?.querySelector('.age')
          ?.getAttribute('title');
      },
    },
  });

  expect(results).toMatchSnapshot();
});
