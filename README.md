# Papercut

Papercut is a scraping/crawling library for Node.js. It provides features that make it fairly easy to scrape a webpage with.

Papercut is still in early days and the API might change a lot in the future. 

## Features

### JSDOM Integration

Instead of relying on a headless browser engine, papercut relies on JSDOM to process client-side javascript code. This means that Papercut is also able to scrape Single Page Applications _(to a certain extent)_.

### Page Caching

As many websites introduce rate limits or blocks for scrapers, page caching is a useful feature for scraping.

Once Papercut hits a page, it stores the payload locally in order to reuse it for subsequent executions. This reduces the need for network requests.

**Note:** when scraping a big amount of pages, be mindful about disk space.

### Cached Geosearch

Sometimes when scraping pages for a list of locations, you might want to convert those into latitude and longitude points. Papercut comes with a geosearch handler with caching that enables you to convert scraped addresses into lat/lng objects.

### Easy for simple tasks, flexible for difficult ones

Papercut offers a nice selector foundation for basic needs of a scraping tooling. Text, attributes, url, image srcs, and many other handy selectors.

When you face yourself with a situation where a simple selector wouldn't be enough: you'll still be able to access the element, the window, or even create a new window instance if needed.

As tasks can grow on complexity, Papercut focus on being a guardrail but not a gatekeeper.

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
/**
 * demo-scraper.mjs
 *
 * This is a hacker news homepage scraper.
 * It will scrape all news from the homepage
 * and print a json matching the selector schema
 * in the stdout.
 */
import papercut from "@armand1m/papercut";

const scraper = new papercut.Scraper({
  name: `Hacker News`,
  baseUrl: `https://news.ycombinator.com/`
}, {
  log: process.env.DEBUG === 'true',
  cache: true,
})
  .forEach(".athing")
  .createSelectors({
    rank: ({ text }) => text(".rank"),
    name: ({ text }) => text(".storylink"),
    url: ({ href }) => href(".storylink"),
    score: ({ element }) => {
      const score = element.nextElementSibling.querySelector(".score");
      return score.textContent;
    },
    createdBy: ({ element }) => {
      const hnuser = element.nextElementSibling.querySelector(".hnuser");
      return hnuser.textContent;
    },
    createdAt: ({ element }) => {
      const creationDate = element.nextElementSibling.querySelector(".age");
      return creationDate.getAttribute("title");
    },
  });

const results = await scraper.run();

console.log(JSON.stringify(results, null, 2))
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

After that, feel free to update the `examples` folder to test your changes.

Hopefully in the future, this will include a test runner a well to make the development experience a bit more reliable and enjoyable.

## Roadmap

- Add unit tests
- Add documentation generation
- Create medium article introducing the library
- Create a gh-pages for the library
- Create more examples

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
