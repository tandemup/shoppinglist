// utils/search/openGeneralSearch.js
export async function openGeneralSearch(query) {
  const engineKey = await getGeneralSearchEngine();
  const engine = SEARCH_ENGINES[engineKey] || SEARCH_ENGINES.google;
  Linking.openURL(engine.buildUrl(query));
}
