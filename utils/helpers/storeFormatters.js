export function formatOpeningHours(store) {
  if (store.openingHours?.text) {
    return store.openingHours.text;
  }

  if (typeof store.hours === "string") {
    return store.hours;
  }

  return null;
}

export function formatCityZip(store) {
  if (!store) return null;

  const city = store.city?.trim();
  const zip = store.zipcode?.trim();

  if (city && zip) return `${zip} · ${city}`;
  if (city) return city;
  if (zip) return zip;

  return null;
}
