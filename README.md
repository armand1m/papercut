# papercut

Papercut is a scraping/crawling library for Node.js

It provides an abstraction layer on top of JSDOM with helpful features while scraping websites.

## Features

### JSDOM Integration

Instead of relying on a headless browser engine, papercut relies on JSDOM to process client-side javascript code. This means that Papercut is also able to scrape Single Page Applications _(to a certain extent)_.

#### Why not use `puppeteer`, `selenium` or `webdriver`?

JSDOM is lighter and easier than using a headless browser engine and allows for enough scraping capabilities. Setup is minimal and it works out-of-the box with minimal overhead to users of this library. 

#### Why not use `cheerio`?

It is being considered. I see papercut being flexible in the future to use different engines, so you'd be able to switch from JSDOM to cheerio.

### Page Caching

As many websites introduce rate limits or blocks for scrapers, page caching is a useful feature for scraping.

Once Papercut hits a page, it stores the payload locally in order to reuse it for subsequent executions. This reduces the need for network requests.

**Note:** when scraping for a huge amount of pages, be careful about disk space.

## Install

```sh
yarn add papercut
```

## Usage

```ts
import papercut from "papercut";

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
