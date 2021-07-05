import papercut from "papercut";

const createLabeledUrl = (label, url) => ({ label, url });

const scraper = new papercut.Scraper({
  name: "Amsterdam Coffeeshops",
  baseUrl: "https://amsterdamcoffeeshops.com/search/item/coffeeshops",
}, {
  log: false,
  cache: true,
})
  .usePagination({
    lastPageNumberSelector: ".navigation > .pagination > li:nth-child(8) > a",
    createPaginatedUrl: (metadata, pageNumber) => {
      return `${metadata.baseUrl}/p:${pageNumber}`
    },
  })
  .forEach(".summary-box")
  .createSelectors({
    name: ({ text }) => {
      return text(".media-body > h3 > a");
    },
    description: ({ text }) => {
      return text(".media-body > .summary-desc");
    },
    photo: ({ src }) => {
      return ({ url: src(".media-left > a > img") });
    },
    phone: ({ text }) => {
      return text(".media-right > .contact-info > mark > a");
    },
    address: ({ text }) => {
      const address = text(".media-body > address > p");

      if (!address) {
        return undefined;
      }

      return address
        .replace(/\s+/g, " ")
        .replace(/^\s+|\s+$/g, "");
    },
    location: async (selectors, $this) => {
      const address = $this.address(selectors, $this);
      return selectors.geosearch(address);
    },
    social: ({ href }) => {
      const websiteHref = href(".visit-website");
      return websiteHref
        ? [createLabeledUrl("Official Website", websiteHref)]
        : [];
    },
    menus: () => {
      /** TODO: scrape menus */
      return [];
    },
    badges: ({ element }) => {
      const badgeNodeList = element.querySelectorAll(".media-left > div > div > img");
      const nodes = Array.prototype.slice.call(badgeNodeList);

      return nodes
        .map(badge => badge.getAttribute("title"))
        .filter(badge => badge !== undefined);
    },
    rating: ({ className }) => {
      const rateNumber = className(".media-right > .summary-info > span > span")
      
      if (!rateNumber) {
        return 0;
      }

      return Number(rateNumber.replace("rate-", ""));
    }
  });

const results = await scraper.run();

console.log(JSON.stringify(results, null, 2));

