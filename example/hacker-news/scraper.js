import papercut from "papercut";

const scraper = new papercut.Scraper({
  name: `Hacker News`,
  baseUrl: `https://news.ycombinator.com/`
}, {
  log: process.env.DEBUG === 'true',
  cache: true,
})
  .forEach(".athing")
  .createSelectors({
    rank: ({ text }) => text(".rank"),
    name: ({ text }) => text(".storylink"),
    url: ({ href }) => href(".storylink"),
    score: ({ element }) => {
      const score = element.nextElementSibling.querySelector(".score");
      return score.textContent;
    },
    createdBy: ({ element }) => {
      const hnuser = element.nextElementSibling.querySelector(".hnuser");
      return hnuser.textContent;
    },
    createdAt: ({ element }) => {
      const creationDate = element.nextElementSibling.querySelector(".age");
      return creationDate.getAttribute("title");
    },
  });

const results = await scraper.run();

console.log(JSON.stringify(results, null, 2))
