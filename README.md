# Papercut

Papercut is a scraping/crawling library for Node.js

It provides an abstraction layer on top of JSDOM with helpful features while scraping websites.

## Features

### JSDOM Integration

Instead of relying on a headless browser engine, papercut relies on JSDOM to process client-side javascript code. This means that Papercut is also able to scrape Single Page Applications _(to a certain extent)_.

### Page Caching

As many websites introduce rate limits or blocks for scrapers, page caching is a useful feature for scraping.

Once Papercut hits a page, it stores the payload locally in order to reuse it for subsequent executions. This reduces the need for network requests.

**Note:** when scraping for a huge amount of pages, be careful about disk space.

### Cached Geosearch

Sometimes when scraping pages for a list of locations, you might want to convert those into latitude and longitude points. Papercut comes with a geosearch handler with caching that enables you to convert scraped addresses into lat/lng objects.

## Usage/Examples

You can find more examples in the `./examples` folder.

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

Setup a scraper instance and set the selectors and how to fill them using the utilities offered:

```javascript
/* demo-scraper.mjs */
import papercut from "@armand1m/papercut";

const scraper = papercut
  .createScraper({
    name: "Amsterdam Coffeeshops",
    baseUrl: "https://amsterdamcoffeeshops.com/search/item/coffeeshops",
  })
  .forEach(".summary-box")
  .createSelectors({
    name: ({ text }) => text(".media-body > h3 > a"),
    description: ({ text }) => text(".media-body > .summary-desc"),
    photo: ({ src }) => ({ url: src(".media-left > a > img") }),
    phone: ({ text }) => text(".media-right > .contact-info > mark > a"),
    address: ({ text }) => text(".media-body > address > p")
      .replace(/\s+/g, " ")
      .replace(/^\s+|\s+$/g, ""),
    location: ({ text, geosearch }, $this) => geosearch($this.address({ text })),
    social: ({ href }) => {
      const websiteHref = href(".visit-website");
      return websiteHref
        ? [createLabeledUrl("Official Website", websiteHref)]
        : [];
    },
    menus: () => [],
    badges: ({ element }) => {
      return [
        ...element.querySelectorAll(".media-left > div > div > img")
      ].map(badge => badge.getAttribute("title") || "")
    },
    rating: ({ className }) => Number(className(".media-right > .summary-info > span > span").replace("rate-", ""))
  });

const results = await scraper.run();

console.log(results);
```

Then run it:

```sh
node ./demo-scraper.mjs
```
  
## API Reference

_TBD_
  
## Environment Variables

Papercut works well out of the box, but some environment variables are available for customizing behavior:

`DEBUG`: enables debug level logs. Accepts `1` or `0`.

## Running Tests

To run tests, run the following command

```bash
  yarn test
```

## Run Locally

Clone the project

```bash
  git clone https://github.com/armand1m/papercut
```

Go to the project directory

```bash
  cd papercut
```

Install dependencies

```bash
  yarn
```

## Roadmap

- Add unit tests
- Add hacker news scraping example
- Add documentation generation
- Create medium article introducing the library

## Contributing

Contributions are always welcome!

See `CONTRIBUTING.md` for ways to get started.

Please adhere to this project's `code of conduct`.

## FAQ

#### Why not use `puppeteer`, `selenium` or `webdriver`?

JSDOM is lighter and easier than using a headless browser engine and allows for enough scraping capabilities. Setup is minimal and it works out-of-the box with minimal overhead to users of this library. 

#### Why not use `cheerio`?

It is being considered. I see papercut being flexible in the future to use different engines, so you'd be able to switch from JSDOM to cheerio.

## Authors

- [@armand1m](https://www.github.com/armand1m)
