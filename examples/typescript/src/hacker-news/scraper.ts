import papercut from '@armand1m/papercut';

const main = async () => {
  const scraper = new papercut.Scraper(
    {
      name: `Hacker News`,
      baseUrl: `https://news.ycombinator.com/`,
    },
    {
      log: process.env.DEBUG === 'true',
      cache: true,
    }
  )
    .forEach('.athing')
    .createSelectors({
      rank: ({ text }) => text('.rank'),
      name: ({ text }) => text('.storylink'),
      url: ({ href }) => href('.storylink'),
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
    });

  const results = await scraper.run();

  console.log(JSON.stringify(results, null, 2));
};

main();
