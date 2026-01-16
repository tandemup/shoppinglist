export default function getDaysSinceJanuary1() {
  const today = new Date();

  const startOfYear = new Date(
    today.getFullYear(),
    0, // enero
    1
  );

  const diffMs = today - startOfYear;

  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}
