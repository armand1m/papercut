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
        const badges = [...all('.media-left > div > div > img')];

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
