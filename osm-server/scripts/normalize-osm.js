import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { normalizeAndFilterStores } from "../helpers/normalizeStores.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// paths seguros
const rawPath = path.join(__dirname, "..", "data", "stores_raw_osm.json");
const normalizedPath = path.join(
  __dirname,
  "..",
  "data",
  "stores_normalized.json"
);

const raw = JSON.parse(fs.readFileSync(rawPath, "utf-8"));
const normalized = normalizeAndFilterStores(raw);

fs.writeFileSync(normalizedPath, JSON.stringify(normalized, null, 2), "utf-8");

console.log(`✅ Normalized ${normalized.length} stores`);
