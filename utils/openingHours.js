export function isOpenNow(openingHours) {
  if (!openingHours) return null;

  const now = new Date();
  const day = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"][now.getDay()];
  const ranges = openingHours[day];

  if (!ranges || ranges.length === 0) return false;

  const minutesNow = now.getHours() * 60 + now.getMinutes();

  return ranges.some((range) => {
    const [start, end] = range.split("-");
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);

    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;

    return minutesNow >= startMin && minutesNow <= endMin;
  });
}
