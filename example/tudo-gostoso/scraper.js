import papercut from "@armand1m/papercut";

const scraper = new papercut.Scraper({
  name: `Tudo Gostoso`,
  baseUrl: `https://www.tudogostoso.com.br/receita/47884-esfiha-de-carne-adaptada-receita-turca.html`
}, {
  log: process.env.DEBUG === 'true',
  cache: true,
})
  .forEach(".recipe-container")
  .createSelectors({
    name: ({ text }) => text(".recipe-title > h1"),
    rating: ({ text }) => text("#rating-average > span:nth-child(2)"),
    preparationTime: ({ text }) => text(".num.preptime > time"),
    recipeYield: ({ text }) => text("data[itemprop='recipeYield']"),
    images: ({ all }) => {
      const images = [...all(".recipe-media img")]
      return images.map(node => node.getAttribute("src"))
    },
    ingredients: ({ all }) => {
      const ingredients = [...all("span[itemprop='recipeIngredient']")]
      return ingredients.map(node => node.textContent);
    },
    instructions: ({ all }) => {
      const instructions = [...all("div[itemprop='recipeInstructions'] ol:first-child > li > span")]
      return instructions.map(node => node.textContent);
    }
  });

const results = await scraper.run();

console.log(JSON.stringify(results, null, 2))

