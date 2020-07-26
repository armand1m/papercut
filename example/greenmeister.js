const papercut = require("papercut");
const createLabeledUrl = (label, url) => ({ label, url });

const main = async () => {
  const scraper = new papercut.Scraper({
    name: "Greenmeister - Amsterdam",
    baseUrl: "https://greenmeister.nl/coffeeshops/amsterdam",
  }, {
    log: false,
    cache: true,
  })
    .forEach(".single-shop")
    .createSelectors({
      name: ({ text }) => {
        return text(".shoptitle")
      },
      description: () => {
        return ""
      },
      photo: ({ src }) => {
        return ({ url: src(".shopimage") })
      },
      phone: () => {
        return ""
      },
      address: ({ attr, text }) => {
        const city = attr(".shopaddress > meta[itemprop='addressLocality']", "content");
        const province = attr(".shopaddress > meta[itemprop='addressRegion']", "content");
        const streetAddress = text(".shopaddress > span[itemprop='streetAddress']");
      
        return `${streetAddress}, ${city}, ${province}`;
      },
      location: async ({ attr }) => {
        const latitude = attr("meta[itemprop='latitude']", "content");
        const longitude = attr("meta[itemprop='longitude']", "content");
        return {
          latitude,
          longitude,
        };
      },
      social: () => {
        const websiteHref = undefined;
        return websiteHref
          ? [createLabeledUrl("Official Website", websiteHref)]
          : [];
      },
      menus: () => {
        return [];
      },
      badges: () => {
        return [];
      },
      rating: ({ attr }) => {
        return Number(attr(".rating > input[checked]", "value"));
      }
    });
  
  const results = await scraper.run();

  console.log(JSON.stringify(results, null, 2));
};

main();