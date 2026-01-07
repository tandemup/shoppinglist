import { geocode } from "../services/nominatim.service.js";
import { fetchSupermarkets } from "../services/overpass.service.js";
import { normalizeOSMStore } from "../utils/storeNormalizer.js";

export async function getStoresByCity(req, res) {
  const { city } = req.query;
  if (!city) return res.status(400).json({ error: "city required" });

  const geo = await geocode(city);
  if (!geo) return res.json([]);

  const bbox = geo.boundingbox.map(Number);
  const elements = await fetchSupermarkets(bbox);

  const stores = elements.map(normalizeOSMStore);
  res.json(stores);
}
