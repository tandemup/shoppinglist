// utils/searchHelpers.js
import { getAllLists } from "./storage/listStorage";

/**
 * Busca productos similares en todas las listas (menos la actual)
 */
export async function searchItemsAcrossLists(query) {
  if (!query || !query.trim()) return [];

  const normalizedQuery = query.trim().toLowerCase();
  const allLists = await getAllLists();
  const results = [];

  allLists.forEach((list) => {
    list.items.forEach((item) => {
      const itemName = (item.name || "").toLowerCase();
      if (itemName.includes(normalizedQuery)) {
        results.push({
          item,
          listId: list.id,
          listName: list.name,
        });
      }
    });
  });

  return results;
}
