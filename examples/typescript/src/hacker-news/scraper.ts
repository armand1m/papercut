import { createScraper } from '@armand1m/papercut';

const main = async () => {
  const scraper = createScraper({
    name: `Hacker News`,
    options: {
      log: process.env.DEBUG === 'true',
      cache: true,
    }
  });

  const results = await scraper.run({
    strict: true,
    baseUrl: "https://news.ycombinator.com/",
    target: ".athing",
    selectors: {
      rank: ({ text }) => text('.rank'),
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
    }
  });

  console.log(JSON.stringify(results, null, 2));
};

main();
