# papercut

## Install

```sh
yarn add papercut
```

## Usage

```ts
import * as papercut from "papercut";

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
```