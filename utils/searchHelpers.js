// utils/searchHelpers.js

import { loadLists } from "./storage/listStorage";

/**
 * Busca productos en todas las listas guardadas
 * Devuelve un array de:
 * {
 *   item: objeto del producto,
 *   listId: string,
 *   listName: string
 * }
 */
export async function searchItemsAcrossLists(query) {
  const text = query.toLowerCase().trim();
  if (!text) return [];

  const lists = await loadLists();
  let results = [];

  for (const list of lists) {
    for (const item of list.items || []) {
      if (item.name?.toLowerCase().includes(text)) {
        results.push({
          item,
          listId: list.id,
          listName: list.name,
        });
      }
    }
  }

  return results;
}
