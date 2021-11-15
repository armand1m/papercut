import { createScraper } from '@armand1m/papercut';

const baseUrl = 'https://www.myinstants.com';

const main = async () => {
  const scraper = createScraper(
    {
      name: 'My Instants',
      options: {
        cache: true,
      }
    },
  );

  const results = await scraper.run({
    strict: false,
    baseUrl,
    target: '.instant',
    pagination: {
      enabled: true,
      lastPageNumberSelector: '#results-pagination > li:nth-child(7)',
      createPaginatedUrl: (baseUrl, pageNumber) => {
        return `${baseUrl}/index/us/?page=${pageNumber}`;
      }
    },
    selectors: {
      instantName: ({ text }) => text('.instant-link'),
      instantPageUrl: ({ href }) =>
      `${baseUrl}${href('.instant-link')}`,
      instantSoundUrl: async (selectors, $this) => {
        const { fetchPage, createWindow } = selectors;
        const soundPageUrl = $this.instantPageUrl(selectors, $this);

        const soundHTML = await fetchPage(soundPageUrl);
        const soundWindow = createWindow(soundHTML);
        const soundDocument = soundWindow.document;

        const ogAudioMeta = soundDocument.querySelector(
          `meta[property="og:audio"]`
        );
        const ogAudioTypeMeta = soundDocument.querySelector(
          `meta[property="og:audio:type"]`
        );
        const soundUrl = ogAudioMeta.getAttribute('content');
        const soundType = ogAudioTypeMeta.getAttribute('content');

        soundWindow.close();

        return {
          soundUrl,
          soundType,
        };
      },
    }
  })

  console.log(JSON.stringify(results, null, 2));
};

main();
