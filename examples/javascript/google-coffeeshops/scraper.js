import papercut from '@armand1m/papercut';
import amsterdamCoffeeshops from './amsterdam-coffeeshops.json';

const createLabeledUrl = (label, url) => ({ label, url });

const promises = amsterdamCoffeeshops.map((coffeeshop) => {
  const scraper = new papercut.Scraper(
    {
      name: `Google - ${coffeeshop.name}`,
      baseUrl: `https://www.google.com/search?q=${encodeURIComponent(
        `${coffeeshop.name} ${coffeeshop.address}`
      )}&ie=UTF-8&lr=lang_nl&sa=X`,
    },
    {
      log: process.env.DEBUG === 'true',
      cache: true,
    }
  )
    .forEach('#main > div:nth-child(4) > div')
    .createSelectors({
      name: ({ text }) => {
        return text(
          'div:nth-child(1) > span:nth-child(2) > h3 > div'
        );
      },
      phone: ({ text }) => {
        /** TODO: improve, sometimes gets messed up */
        return text(
          'div.vbShOe.kCrYT > div.AVsepf.u2x1Od > div > span:nth-child(2) > span'
        );
      },
      social: ({ href }) => {
        const websiteHref = href(
          'div:nth-child(3) > div > a:nth-child(2)'
        );
        return websiteHref
          ? [createLabeledUrl('Official Website', websiteHref)]
          : [];
      },
      address: ({ text }) => {
        return text(
          'div.vbShOe.kCrYT > div:nth-child(1) > div > span:nth-child(2) > span'
        );
      },
      rating: ({ text }) => {
        return Number(
          text(
            'div:nth-child(1) > span:nth-child(3) > div > span > span.oqSTJd'
          )
        );
      },
    });

  return scraper.run();
});

const results = await Promise.all(promises);

console.log(JSON.stringify(results, null, 2));
