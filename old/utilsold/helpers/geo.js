export const extractZipcode = (address) => {
  if (!address) return null;
  const match = address.match(/\b\d{5}\b/);
  return match ? match[0] : null;
};
