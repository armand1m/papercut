import * as Index from './';

test('exports expected modules', () => {
  expect(Index.geosearch).toBeDefined();
  expect(Index.scrape).toBeDefined();
  expect(Index.createRunner).toBeDefined();
  expect(Index.createScraper).toBeDefined();
  expect(Index.createSelectorUtilities).toBeDefined();
});
