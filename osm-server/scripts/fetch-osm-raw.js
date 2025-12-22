import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { fetchSupermarkets } from "../services/overpass.service.js";

// utils ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- CONFIG ----
// bounding box de Asturias (aprox)
const ASTURIAS_BBOX = [
  42.9, // south
  43.7, // north
  -7.2, // west
  -4.3, // east
];

// paths
const rawPath = path.join(__dirname, "..", "data", "stores_raw_osm.json");

async function run() {
  console.log("🌍 Fetching supermarkets from Overpass...");

  const elements = await fetchSupermarkets(ASTURIAS_BBOX);

  console.log(`📦 Fetched ${elements.length} raw elements`);

  fs.writeFileSync(rawPath, JSON.stringify(elements, null, 2), "utf-8");

  console.log(`✅ Saved to data/stores_raw_osm.json`);
}

run().catch((err) => {
  console.error("❌ Error fetching OSM data", err);
  process.exit(1);
});
