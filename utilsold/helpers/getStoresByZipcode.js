export async function getStoresByZipcode(req, res) {
  const { zipcode } = req.query;
  if (!zipcode) return res.status(400).json({ error: "zipcode required" });

  const geo = await geocode(zipcode);
  if (!geo) return res.json([]);

  const bbox = geo.boundingbox.map(Number);
  const elements = await fetchSupermarkets(bbox);

  const stores = elements
    .map(normalizeOSMStore)
    .filter((s) => s.zipcode === zipcode);

  res.json(stores);
}
