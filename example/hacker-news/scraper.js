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
      const id = element.getAttribute("id");
      const siblingRow = element.parentNode.querySelector(`tr[id='${id}'] + tr`);
      const score = siblingRow.querySelector(".score");

      return score.textContent;
    },
    createdBy: ({ element }) => {
      const id = element.getAttribute("id");
      const siblingRow = element.parentNode.querySelector(`tr[id='${id}'] + tr`);
      const hnuser = siblingRow.querySelector(".hnuser");

      return hnuser.textContent;
    },
    createdAt: ({ element }) => {
      const id = element.getAttribute("id");
      const siblingRow = element.parentNode.querySelector(`tr[id='${id}'] + tr`);
      const creationDate = siblingRow.querySelector(".age");

      return creationDate.getAttribute("title");
    },
  });

const results = await scraper.run();

console.log(JSON.stringify(results, null, 2))
