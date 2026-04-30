import * as Linking from "expo-linking";
import { SEARCH_ENGINES } from "../../constants/searchEngines";
import { getSearchSettings } from "../../src/storage/settingsStorage";

export async function openGeneralSearch(query) {
  const settings = await getSearchSettings();
  const engineKey = settings?.generalEngine || "google";

  const engine = SEARCH_ENGINES[engineKey] || SEARCH_ENGINES.google;

  const url = engine.buildUrl(query);
  const canOpen = await Linking.canOpenURL(url);

  if (!canOpen) {
    throw new Error(`No se puede abrir la URL: ${url}`);
  }

  await Linking.openURL(url);
}
