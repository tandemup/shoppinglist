const BASE_URL = "http://localhost:3000";
// cambia si usas Android o móvil real

export async function fetchNormalizedStores() {
  const res = await fetch(`${BASE_URL}/stores/normalized`);

  if (!res.ok) {
    throw new Error("Error fetching stores");
  }

  const data = await res.json();
  return data.stores;
}
