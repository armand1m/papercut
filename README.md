# Papercut

Papercut is a scraping/crawling library for Node.js, written in Typescript.

It provides a type-safe and small foundation that makes it fairly easy to scrape webpages with confidence.

## Features

### Selectors API

Inspired by GraphQL Resolvers, Papercut works similarly by allowing you to specify selectors for each scraper runner.
The type definition for the scrape result array items is guaranteed to be compliant with the selectors given.

### JSDOM Integration

Instead of relying on a headless browser engine, papercut relies on JSDOM to process client-side javascript code. This means that Papercut is also able to scrape Single Page Applications *(to a certain extent)*.

### Concurrency controls

Papercut makes usage of Promise Pools to run pagination, node scraping and selector scraping. It comes with sane defaults for simple tasks, but configurable properties to make sure you have the flexibility to suit your needs.

### Pagination

In most cases when web scraping, you're looking to scrape a feed. This feed can be quite long and you might have other challenges like pagination and a hard to predict total number of pages.

Luckily, most of the time, there is some way to figure the last page number in the UI. Papercut allows you to set a selector to find an element that contains the last page number and a callback for creating the url for each page number using the base url.

As page urls are not always implemented in the same way, Papercut leaves it up to you to tell it how to build it.

### Page Caching

As many websites introduce rate limits or blocks for scrapers, page caching is a useful feature for scraping.

Once Papercut hits a page, it stores the payload locally in order to reuse it for subsequent executions. This reduces the need for network requests.

**Note:** when scraping a big amount of pages, be mindful about disk space. Papercut **does not** handle cache invalidation.

### Cached Geosearch

Sometimes when scraping pages for a list of locations, you might want to convert those into latitude and longitude points. Papercut comes with a geosearch handler with caching that enables you to convert scraped addresses into lat/lng objects.

To avoid overloading the services that papercut uses for that *(like Nominatin from OpenStreetMap)*, we cache the results to save on subsequent requests and add concurrency limits to comply with rate limits.

### Easy for simple tasks, flexible for difficult ones

Papercut offers a nice selector foundation for basic needs of a scraping tooling. Text, attributes, url, image srcs, and many other handy selectors.

When you face yourself with a situation where a simple selector wouldn't be enough: you'll still be able to access the element, the window, or even create a new window instance if needed.

As tasks can grow on complexity, Papercut focus on being a guardrail but not a gatekeeper.

## Usage/Examples

You can find more examples in the `./examples` folder.

### Quick example

Create an empty project with yarn:

```sh
mkdir papercut-demo
cd papercut-demo
yarn init -y
```

Add papercut:

```sh
yarn add @armand1m/papercut
```

#### Single page scraper

For this example, we gonna scrape Hacker News first page.

Setup a scraper instance and set the selectors using the utilities offered:

```ts file=./examples/typescript/src/hacker-news/scraper.ts
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
```

Then run it using `node` or `ts-node`:

```sh
npx ts-node ./single-page-scraper.ts
```

#### Paginated scraper

For this example, because I live in Amsterdam, we gonna scrape the Amsterdam Coffeeshops website for all coffeeshops in Amsterdam.

Setup a scraper instance and set the selectors using the utilities offered:

```ts file=./examples/typescript/src/amsterdam-coffeeshops/scraper.ts
import { createScraper } from '@armand1m/papercut';

const createLabeledUrl = (label: string, url: string) => ({ label, url });

const main = async () => {
  const scraper = createScraper(
    {
      name: 'Amsterdam Coffeeshops',
      options: {
        cache: true,
      },
    },
  );

  const results = await scraper.run({
    strict: true,
    target: '.summary-box',
    baseUrl: 'https://amsterdamcoffeeshops.com/search/item/coffeeshops',
    pagination: {
      enabled: true,
      lastPageNumberSelector: '.navigation > .pagination > li:nth-child(8) > a',
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
        const { asArray: badges } = all('.media-left > div > div > img');

        return badges
          .map((badge) => badge.getAttribute('title'))
          .filter((badge) => badge !== undefined);
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
    }
  });

  console.log(JSON.stringify(results, null, 2));
};

main();
```

Then run it using `node` or `ts-node`:

```sh
npx ts-node ./paginated-scraper.ts
```

## API Reference

[Click here to open the API reference.](https://armand1m.github.io/papercut)

## Environment Variables

Papercut works well out of the box, but some environment variables are available for customizing behavior:

`DEBUG=true`: enables debug level logs.

## Roadmap

*   [x] Add unit tests
*   [x] Add documentation generation
*   [x] Create a gh-pages for the library
*   [x] Create more examples
*   [ ] Create medium article introducing the library

## Contributing

Contributions are always welcome!

See `CONTRIBUTING.md` for ways to get started.

## FAQ

#### Why not use `puppeteer`, `selenium` or `webdriver`?

JSDOM is lighter and easier than using a headless browser engine and *(I hope that it)* allows for enough scraping capabilities. Setup is minimal and it works out-of-the box with minimal overhead to users of this library. Please open an issue if you'd like to discuss more about this, I can definitely be wrong.

#### Why not use `cheerio`?

I like the idea. I see papercut being flexible in the future to use different engines, so you'd be able to switch from JSDOM to cheerio, though I'm not sure if I see much value on it. Please open an issue if you'd like to discuss a possible API implementation here.

## Contributors

| Website                | Name                  |
| ---------------------- | --------------------- |
| <https://armand1m.dev> | **Armando Magalhaes** |
