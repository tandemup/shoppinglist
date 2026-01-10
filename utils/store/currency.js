export function formatCurrency(value, currency = "EUR", locale = "es-ES") {
  const amount = Number(value) || 0;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}
