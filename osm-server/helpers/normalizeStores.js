export function normalizeOSMStore(el) {
  const tags = el.tags ?? {};

  // --- coordenadas (OSM es inconsistente) ---
  const lat =
    el.lat ??
    el.center?.lat ??
    el.geometry?.[0]?.lat ??
    (typeof el.lat === "string" ? parseFloat(el.lat) : null);

  const lon =
    el.lon ??
    el.center?.lon ??
    el.geometry?.[0]?.lon ??
    (typeof el.lon === "string" ? parseFloat(el.lon) : null);

  // si no hay coordenadas, descartamos
  if (lat == null || lon == null) return null;

  return {
    id: `osm-${el.id}`,
    name: tags.name ?? tags.brand ?? "Supermercado",
    address: [tags["addr:street"], tags["addr:housenumber"]]
      .filter(Boolean)
      .join(" "),
    city: tags["addr:city"] ?? null,
    zipcode: tags["addr:postcode"] ?? null,
    location: {
      latitude: lat,
      longitude: lon,
    },
    hours: tags.opening_hours ?? null,
    source: "osm",
  };
}

export function normalizeAndFilterStores(elements = []) {
  return elements.map(normalizeOSMStore).filter(Boolean);
}
