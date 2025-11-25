// utils/isISBN.js
export function isISBN(raw) {
  if (!raw) return false;

  const code = raw.replace(/[^0-9X]/gi, ""); // limpiar símbolos

  // ISBN-13: 978 / 979 + 10 dígitos
  if (
    code.length === 13 &&
    (code.startsWith("978") || code.startsWith("979"))
  ) {
    return true;
  }

  // ISBN-10
  if (code.length === 10) {
    return true;
  }

  return false;
}
