import papercut from "papercut";

const scraper = new papercut.Scraper({
  name: `Tudo Gostoso`,
  baseUrl: `https://www.tudogostoso.com.br/receita/47884-esfiha-de-carne-adaptada-receita-turca.html`
}, {
  log: true,
  cache: true,
})
  .forEach(".recipe-container")
  .createSelectors({
    name: ({ text }) => text(".recipe-title > h1"),
    rating: ({ text }) => text("#rating-average > span:nth-child(2)"),
    preparationTime: ({ text }) => text(".num.preptime > time"),
    recipeYield: ({ text }) => text("data[itemprop='recipeYield']"),
    images: ({ element }) => {
      const images = [...element.querySelectorAll(".recipe-media img")].map(node => node.getAttribute("src"))
      return images;
    },
    ingredients: ({ element }) => {
      const ingredients = [...element.querySelectorAll("span[itemprop='recipeIngredient']")].map(node => node.textContent);
      return ingredients;
    },
    instructions: ({ element }) => {
      const instructions = [...element.querySelectorAll("div[itemprop='recipeInstructions'] ol:first-child > li > span")].map(node => node.textContent);
      return instructions;
    }
  });

const results = await scraper.run();

console.log(JSON.stringify(results, null, 2))

