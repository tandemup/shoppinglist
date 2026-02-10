#!/usr/bin/env node

/**
 * Extrae paths SVG oficiales de Ionicons y genera icons/index.js
 *
 * Requisitos de estructura:
 *
 *  proyecto/
 *  ├─ icons.txt                  (lista de iconos, uno por línea)
 *  ├─ icons/
 *  │  └─ index.js                (se genera automáticamente)
 *  ├─ scripts/
 *  │  └─ extract-ionicons.js     (este script)
 *  └─ ionicons/
 *     └─ icons/
 *        ├─ cart-sharp.svg
 *        ├─ cart-outline.svg
 *        └─ ...
 */

const fs = require("fs");
const path = require("path");

// --------------------------------------------------
// Configuración de paths
// --------------------------------------------------

const PROJECT_ROOT = process.cwd();
const ICONS_TXT = path.join(PROJECT_ROOT, "icons.txt");
const OUTPUT_INDEX = path.join(PROJECT_ROOT, "icons", "index.js");
const IONICONS_DIR = path.join(PROJECT_ROOT, "ionicons", "icons");

// --------------------------------------------------
// Validaciones iniciales
// --------------------------------------------------

if (!fs.existsSync(ICONS_TXT)) {
  console.error("❌ No se encuentra icons.txt en la raíz del proyecto");
  process.exit(1);
}

if (!fs.existsSync(IONICONS_DIR)) {
  console.error("❌ No se encuentra ionicons/icons");
  console.error(
    "👉 Ejecuta: git clone https://github.com/ionic-team/ionicons.git",
  );
  process.exit(1);
}

// --------------------------------------------------
// Leer lista de iconos
// --------------------------------------------------

const ICON_NAMES = fs
  .readFileSync(ICONS_TXT, "utf8")
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean);

// --------------------------------------------------
// Utilidad: resolver nombre real de archivo Ionicons
// --------------------------------------------------

function resolveIoniconFile(name) {
  // Regla Ionicons:
  // - foo           -> foo-sharp.svg
  // - foo-outline   -> foo-outline.svg

  if (name.endsWith("-outline")) {
    return `${name}.svg`;
  }

  return `${name}-sharp.svg`;
}

// --------------------------------------------------
// Procesar iconos
// --------------------------------------------------

const output = {};
const missing = [];

for (const name of ICON_NAMES) {
  const fileName = resolveIoniconFile(name);
  const filePath = path.join(IONICONS_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    missing.push(fileName);
    continue;
  }

  const svg = fs.readFileSync(filePath, "utf8");

  const viewBoxMatch = svg.match(/viewBox="([^"]+)"/);
  const pathMatches = [...svg.matchAll(/<path[^>]*d="([^"]+)"/g)];

  if (!viewBoxMatch || pathMatches.length === 0) {
    console.warn(`⚠️  SVG inválido: ${fileName}`);
    continue;
  }

  const viewBox = viewBoxMatch[1];
  const paths = pathMatches.map((m) => m[1]).join(" ");

  output[name] = {
    type: "svg",
    viewBox,
    path: paths,
  };
}

// --------------------------------------------------
// Generar icons/index.js
// --------------------------------------------------

let file = `/* prettier-ignore-file */
/**
 * Archivo generado automáticamente.
 * NO editar a mano.
 */

export default {
`;

for (const [name, icon] of Object.entries(output)) {
  file += `  "${name}": {
    type: "svg",
    viewBox: "${icon.viewBox}",
    path: "${icon.path}"
  },

`;
}

file += "};\n";

fs.mkdirSync(path.dirname(OUTPUT_INDEX), { recursive: true });
fs.writeFileSync(OUTPUT_INDEX, file, "utf8");

// --------------------------------------------------
// Reporte final
// --------------------------------------------------

console.log("✅ icons/index.js generado correctamente");

if (missing.length > 0) {
  console.warn("\n⚠️  SVGs no encontrados:");
  missing.forEach((m) => console.warn("   -", m));
  console.warn(
    "\n👉 Revisa si el nombre existe en Ionicons o si necesita mapping manual.",
  );
} else {
  console.log("🎉 Todos los iconos se resolvieron correctamente");
}
