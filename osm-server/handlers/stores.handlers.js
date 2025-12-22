import { geocode } from "../services/nominatim.service.js";
import { fetchSupermarkets } from "../services/overpass.service.js";
import { normalizeOSMStore } from "../helpers/normalizeStores.js";

export async function getStoresByCity(req, res) {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: "city required" });

  const geo = await geocode(city);
  if (!geo) return res.json([]);

  const bbox = geo.boundingbox.map(Number);
  const elements = await fetchSupermarkets(bbox);

  res.json(elements.map(normalizeOSMStore));
}

export async function getStoresByZipcode(req, res) {
  const { zipcode } = req.query;
  if (!zipcode) return res.status(400).json({ error: "zipcode required" });

  const geo = await geocode(zipcode);
  if (!geo) return res.json([]);

  const bbox = geo.boundingbox.map(Number);
  const elements = await fetchSupermarkets(bbox);

  res.json(
    elements.map(normalizeOSMStore).filter((s) => s.zipcode === zipcode)
  );
}

export async function getStoresNearby(req, res) {
  const { lat, lon, radius = 1500 } = req.query;
  if (!lat || !lon)
    return res.status(400).json({ error: "lat & lon required" });

  const delta = radius / 111000;
  const bbox = [
    Number(lat) - delta,
    Number(lat) + delta,
    Number(lon) - delta,
    Number(lon) + delta,
  ];

  const elements = await fetchSupermarkets(bbox);
  res.json(elements.map(normalizeOSMStore));
}
