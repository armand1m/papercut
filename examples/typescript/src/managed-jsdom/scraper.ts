import pino from 'pino'
import { scrape, fetchPage, createWindow } from '@armand1m/papercut';

const main = async () => {
  const logger = pino({
    name: 'Hacker News',
    enabled: false
  });

  const rawHTML = await fetchPage('https://news.ycombinator.com/')
  const window = createWindow(rawHTML);

  const results = await scrape({
    strict: true,
    logger,
    document: window.document,
    target: ".athing",
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
    options: {
      log: false,
      cache: true,
      concurrency: {
        page: 2,
        node: 2,
        selector: 2
      }
    }
  });

  window.close();

  console.log(JSON.stringify(results, null, 2));
};

main();
