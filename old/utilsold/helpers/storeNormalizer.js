export function normalizeOSMStore(el) {
  const tags = el.tags ?? {};
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;

  return {
    id: `osm-${el.id}`,
    name: tags.name ?? "Supermercado",
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
    phone: tags.phone ?? null,
    website: tags.website ?? null,
    source: "osm",
  };
}
