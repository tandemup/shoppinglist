/**
 * Devuelve estado de apertura basado en opening_hours (OSM)
 */
export function getOpeningStatus(store, now = new Date()) {
  const raw = store?.hours;
  if (!raw) {
    return {
      open: false,
      label: "Horario no disponible",
    };
  }

  // Caso 24/7
  if (raw.includes("24/7")) {
    return {
      open: true,
      label: "Abierto 24h",
    };
  }

  // Extraer rangos horarios simples HH:MM-HH:MM
  const match = raw.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);
  if (!match) return null;

  const [, opens, closes] = match;

  const [oh, om] = opens.split(":").map(Number);
  const [ch, cm] = closes.split(":").map(Number);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = oh * 60 + om;
  const closeMinutes = ch * 60 + cm;

  const isOpen = nowMinutes >= openMinutes && nowMinutes <= closeMinutes;

  return {
    open: isOpen,
    label: isOpen ? "Abierto ahora" : "Cerrado ahora",
    opens,
    closes,
  };
}
