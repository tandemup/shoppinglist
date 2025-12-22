import { Router } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const router = Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---- paths ----
const rawPath = path.join(__dirname, "data", "stores_raw_osm.json");
const normalizedPath = path.join(__dirname, "data", "stores_normalized.json");

// ---- carga segura ----
const rawStores = fs.existsSync(rawPath)
  ? JSON.parse(fs.readFileSync(rawPath, "utf-8"))
  : [];

const normalizedStores = fs.existsSync(normalizedPath)
  ? JSON.parse(fs.readFileSync(normalizedPath, "utf-8"))
  : [];

// ---- endpoints ----
router.get("/stores/raw", (req, res) => {
  res.json({
    total: rawStores.length,
    stores: rawStores,
  });
});

router.get("/stores/normalized", (req, res) => {
  res.json({
    total: normalizedStores.length,
    stores: normalizedStores,
  });
});

export default router;
