import { orderBy } from 'lodash';
import path from 'path';

process.env.PAPERCUT_PAGE_CACHE_PATH = path.resolve(
  __dirname,
  './__fixtures__/testpagecache'
);

process.env.PAPERCUT_GEOSEARCH_CACHE_PATH = path.resolve(
  __dirname,
  './__fixtures__/testgeocache'
);

test('createScraper - Single page (strict mode off)', async () => {
  const { createScraper } = await import('./createScraper');
  const scraper = createScraper({
    name: `Hacker News`,
    options: {
      log: false,
      cache: true,
    },
  });

  const results = await scraper.run({
    strict: false,
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
      failingOnPurpose: () => {
        throw new Error('nope');
      },
    },
  });

  expect(results).toMatchSnapshot();
});

test('createScraper - Single page (strict mode on)', async () => {
  const { createScraper } = await import('./createScraper');
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

test('createScraper - Pagination', async () => {
  jest.setTimeout(120_000);
  const { createScraper } = await import('./createScraper');

  const createLabeledUrl = (label: string, url: string) => ({
    label,
    url,
  });

  const scraper = createScraper({
    name: 'Amsterdam Coffeeshops',
    options: {
      cache: true,
    },
  });

  const results = await scraper.run({
    strict: true,
    target: '.summary-box',
    baseUrl:
      'https://amsterdamcoffeeshops.com/search/item/coffeeshops',
    pagination: {
      enabled: true,
      lastPageNumberSelector:
        '.navigation > .pagination > li:nth-child(8) > a',
      createPaginatedUrl: (baseUrl, pageNumber) => {
        return `${baseUrl}/p:${pageNumber}`;
      },
    },
    selectors: {
      name: ({ text }) => {
        return text('.media-body > h3 > a');
      },
      description: ({ text }) => {
        return text('.media-body > .summary-desc');
      },
      photo: ({ src }) => {
        return { url: src('.media-left > a > img') };
      },
      phone: ({ text }) => {
        return text('.media-right > .contact-info > mark > a');
      },
      address: ({ text }) => {
        const address = text('.media-body > address > p');

        if (!address) {
          return undefined;
        }

        return address.replace(/\s+/g, ' ').replace(/^\s+|\s+$/g, '');
      },
      location: async (selectors, $this) => {
        const address = $this.address(selectors, $this);
        return selectors.geosearch(address);
      },
      social: ({ href }) => {
        const websiteHref = href('.visit-website');
        return websiteHref
          ? [createLabeledUrl('Official Website', websiteHref)]
          : [];
      },
      menus: () => {
        /** TODO: scrape menus */
        return [];
      },
      badges: ({ all }) => {
        const { asArray: badges } = all(
          '.media-left > div > div > img'
        );

        return badges
          .map((badge) => badge.getAttribute('title'))
          .filter((badge) => badge !== undefined) as string[];
      },
      rating: ({ className }) => {
        const rateNumber = className(
          '.media-right > .summary-info > span > span'
        );

        if (!rateNumber) {
          return 0;
        }

        return Number(rateNumber.replace('rate-', ''));
      },
    },
  });

  const sortedResults = orderBy(
    results,
    [(coffeeshop) => coffeeshop.name.toLowerCase()],
    ['asc']
  );

  expect(sortedResults).toMatchSnapshot();
});
