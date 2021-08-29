# Papercut

Papercut is a scraping/crawling library for Node.js, written in Typescript. It provides features that make it fairly easy to scrape a webpage with.

Papercut is still in early days and the API might change a lot in the future. 

## Features

### JSDOM Integration

Instead of relying on a headless browser engine, papercut relies on JSDOM to process client-side javascript code. This means that Papercut is also able to scrape Single Page Applications _(to a certain extent)_.

### Flexible API 

In most cases when web scraping, you're looking to scrape a feed. This feed is usually a very long list and it might have pagination and a hard to predict total number of pages.

Most of the time, there is some way to figure these things out in the UI though. With this in mind, papercut offers an API that makes it easier for you to just create selectors for all the elements that match a selector.

Papercut treats results always as lists. 

### Page Caching

As many websites introduce rate limits or blocks for scrapers, page caching is a useful feature for scraping.

Once Papercut hits a page, it stores the payload locally in order to reuse it for subsequent executions. This reduces the need for network requests.

**Note:** when scraping a big amount of pages, be mindful about disk space.

### Cached Geosearch

Sometimes when scraping pages for a list of locations, you might want to convert those into latitude and longitude points. Papercut comes with a geosearch handler with caching that enables you to convert scraped addresses into lat/lng objects.

To avoid overloading the services that papercut uses for that _(like Nominatin from OpenStreetMap)_, we cache the results to save on subsequent requests and add concurrency limits to comply with rate limits.

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

Setup a scraper instance and set the selectors and how to fill them using the utilities offered:

```js file=./examples/javascript/hacker-news/scraper.js
```

In case you're using TS or a version of node without support for top-level await, use the code below instead:

```ts file=./examples/typescript/src/hacker-news/scraper.ts
```

Then run it using `node` or `ts-node`:

```sh
node ./demo-scraper.mjs
```

```sh
npx ts-node ./demo-scraper.ts
```
  
## API Reference

_TBD_
  
## Environment Variables

Papercut works well out of the box, but some environment variables are available for customizing behavior:

`DEBUG=true`: enables debug level logs.
## Roadmap

- Add unit tests
- Add documentation generation
- Create medium article introducing the library
- Create a gh-pages for the library
- Create more examples

## Contributing

Contributions are always welcome!

See `CONTRIBUTING.md` for ways to get started.

## FAQ

#### Why not use `puppeteer`, `selenium` or `webdriver`?

JSDOM is lighter and easier than using a headless browser engine and allows for enough scraping capabilities. Setup is minimal and it works out-of-the box with minimal overhead to users of this library. Please open an issue if you'd like to discuss more about this, I can be wrong.

#### Why not use `cheerio`?

I like the idea. I see papercut being flexible in the future to use different engines, so you'd be able to switch from JSDOM to cheerio, though I'm not sure if I see much value on it. Please open an issue if you'd like to discuss a possible API implementation here.

## Contributors 
