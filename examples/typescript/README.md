# typescript-papercut-examples

This is a Node v16 project demonstrating how to use papercut with typescript.

# Scrapers available:

- Hacker News: Scrapes the first page of Hacker News.

# Running a scraper

In this case, make sure you prepared `papercut` in the root directory and built it.

Once done, run `yarn` in this folder.

After that, you should be able to run any scraper:

```sh
yarn run-scraper ./hacker-news/scraper.ts
```

In case you want to write the output to a file, run it with the `--silent` flag to silence yarn noise:

```sh
yarn --silent run-scraper ./hacker-news/scraper.ts
```

To see debug information, run the scraper with the env var `DEBUG=true`:

```sh
DEBUG=true yarn --silent run-scraper ./hacker-news/scraper.ts
```
