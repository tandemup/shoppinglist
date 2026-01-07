// utils/date.js
export const todayISO = () => new Date().toISOString().slice(0, 10);

export const formatDateShort = (d) => new Date(d).toLocaleDateString("es-ES");

export const formatDateTime = (d) =>
  new Date(d).toLocaleString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
