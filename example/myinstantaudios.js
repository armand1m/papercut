const fs = require('fs');
const papercut = require("papercut");

const main = async () => {
  const baseUrl = "https://www.myinstants.com"

  const scraper = new papercut.Scraper({
    name: "My Instants",
    baseUrl,
  }, {
    log: process.env.DEBUG === "1",
    cache: true,
  })
    .usePagination({
      lastPageNumberSelector: "#results-pagination > li:nth-child(7)",
      createPaginatedUrl: (metadata, pageNumber) => `${metadata.baseUrl}/index/us/?page=${pageNumber}`
    })
    .forEach(".instant")
    .createSelectors({
      instantName: ({ text }) => text(".instant-link"),
      instantPageUrl: ({ href }) => `${baseUrl}${href(".instant-link")}`,
      instantSoundUrl: async (selectors, $this) => {
        const { fetchPage, createWindowForHTMLContent } = selectors;
        const soundPageUrl = $this.instantPageUrl(selectors, $this);
        console.log(`[DEBUG]: Fetching ${soundPageUrl}`);

        let soundHTML = await fetchPage(soundPageUrl);
        let soundWindow = createWindowForHTMLContent(soundHTML);
        let soundDocument = soundWindow.document;

        const ogAudioMeta = soundDocument.querySelector(`meta[property="og:audio"]`)
        const ogAudioTypeMeta = soundDocument.querySelector(`meta[property="og:audio:type"]`)
        const soundUrl = ogAudioMeta.getAttribute("content");
        const soundType = ogAudioTypeMeta.getAttribute("content");

        soundWindow.close();
        soundWindow = null;
        soundHTML = null;
        soundDocument = null;

        return {
          soundUrl,
          soundType
        };
      }
    });

  const results = await scraper.run();

  const jsonResults = JSON.stringify(results, null, 2);

  await fs.promises.writeFile("./instantaudios.json", jsonResults, "utf-8");
}

main();