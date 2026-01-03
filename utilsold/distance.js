export function getDistanceKm(from, to) {
  if (!from || !to) return null;

  const R = 6371; // km
  const dLat = deg2rad(to.latitude - from.latitude);
  const dLon = deg2rad(to.longitude - from.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(from.latitude)) *
      Math.cos(deg2rad(to.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}
