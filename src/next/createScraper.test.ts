import { createScraper } from './createScraper';

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
      rank: ({ text }) => {
        const value = text('.rank').replace(/^\D+/g, '');

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

  console.log(results);
});