# papercut-examples

This is a Node v16 project demonstrating how to use papercut.

# Scrapers available:

- Hacker News: Scrapes the first page of Hacker News.
- Tudo Gostoso: Scrapes the first page of all meat meals from a popular Brazilian Recipe website.
- My Instant Audios: Scrapes the entire catalog from myinstantaudios.com into a JSON Object array.
- Amsterdam Coffeeshops: Scrapes the https://amsterdamcoffeeshops.com website and prints a JSON Object array with all data scraped.
- Google Coffeeshops: Uses the output from the Amsterdam Coffeeshops scraper to gather more information from google.

# Running a scraper

In this case, make sure you prepared `papercut` in the root directory and built it.

Once done, run `yarn` in this folder.

After that, you should be able to run any scraper:

```sh
yarn run-scraper ./hacker-news/scraper.js
```

In case you want to write the output to a file, run it with the `--silent` flag to silence yarn noise:

```sh
yarn --silent run-scraper ./hacker-news/scraper.js
```

To see debug information, run the scraper with the env var `DEBUG=true`:

```sh
DEBUG=true yarn --silent run-scraper ./hacker-news/scraper.js
```
