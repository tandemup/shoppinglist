// utils/isISBN.js

/**
 * -----------------------------------------------------------
 * VERSIÓN SIMPLE (tu función original, ligeramente mejorada)
 * -----------------------------------------------------------
 * Detecta ISBN por longitud y prefijos 978/979.
 * No valida checksum.
 */
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

/**
 * -----------------------------------------------------------
 * VERSIÓN COMPLETA (validación real con checksum)
 * -----------------------------------------------------------
 * Esta es la que debes usar para identificar LIBROS con seguridad.
 */
export function isBookBarcode(raw) {
  if (!raw) return false;

  const code = raw.replace(/[^0-9X]/gi, "");

  // ISBN-13: prefijos de libro
  if (
    code.length === 13 &&
    (code.startsWith("978") || code.startsWith("979"))
  ) {
    return isValidISBN13(code);
  }

  // ISBN-10
  if (code.length === 10) {
    return isValidISBN10(code);
  }

  return false;
}

/**
 * Validación ISBN-13 (checksum oficial)
 */
function isValidISBN13(code) {
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    const digit = parseInt(code[i], 10);
    if (isNaN(digit)) return false;
    sum += i % 2 === 0 ? digit : digit * 3;
  }

  const check = (10 - (sum % 10)) % 10;
  const lastDigit = parseInt(code[12], 10);

  return check === lastDigit;
}

/**
 * Validación ISBN-10 (checksum oficial)
 */
function isValidISBN10(code) {
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    const digit = parseInt(code[i], 10);
    if (isNaN(digit)) return false;
    sum += digit * (10 - i);
  }

  const lastChar = code[9];
  const lastDigit = lastChar === "X" ? 10 : parseInt(lastChar, 10);

  if (isNaN(lastDigit)) return false;

  sum += lastDigit;

  return sum % 11 === 0;
}
