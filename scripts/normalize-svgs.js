/**
 * Normalize SVGs for Expo + react-native-svg (SvgXml)
 *
 * - kebab-case attrs -> camelCase
 * - force currentColor
 * - remove unsupported attrs
 */

const fs = require("fs");
const path = require("path");

const ICONS_DIR = path.resolve(__dirname, "../assets/icons");

const ATTR_FIXES = [
  ["stroke-width", "strokeWidth"],
  ["stroke-linecap", "strokeLinecap"],
  ["stroke-linejoin", "strokeLinejoin"],
  ["fill-rule", "fillRule"],
  ["clip-rule", "clipRule"],
];

const REMOVE_ATTRS = [/class="[^"]*"/g, /style="[^"]*"/g, /id="[^"]*"/g];

function normalizeSvg(content) {
  let out = content;

  // Force currentColor
  out = out.replace(/stroke="[^"]*"/g, 'stroke="currentColor"');
  out = out.replace(/fill="[^"]*"/g, 'fill="none"');

  // Fix attributes
  for (const [from, to] of ATTR_FIXES) {
    out = out.replace(new RegExp(from, "g"), to);
  }

  // Remove unsupported attrs
  for (const regex of REMOVE_ATTRS) {
    out = out.replace(regex, "");
  }

  // Clean extra spaces
  out = out.replace(/\s{2,}/g, " ");

  return out.trim();
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (entry.isFile() && entry.name.endsWith(".svg")) {
      const original = fs.readFileSync(fullPath, "utf8");
      const normalized = normalizeSvg(original);

      if (original !== normalized) {
        fs.writeFileSync(fullPath, normalized, "utf8");
        console.log(`✔ normalized: ${path.relative(ICONS_DIR, fullPath)}`);
      }
    }
  }
}

console.log("🔧 Normalizing SVG icons...");
walk(ICONS_DIR);
console.log("✅ Done.");
