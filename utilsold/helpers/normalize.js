// normalize.js
import fs from "fs";
import rawStores from "./stores_Gijon.json" assert { type: "json" };
import { normalizeAndFilterStores } from "./helpers/normalizeStores.js";

const result = normalizeAndFilterStores(rawStores);

fs.writeFileSync(
  "./stores_Gijon.normalized.json",
  JSON.stringify(result, null, 2)
);

console.log(`✔ ${result.length} tiendas válidas`);
