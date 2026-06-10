// Verifies harvested URLs resolve (HTTP 200), prefers durable non-premium photos,
// caps each bucket, and writes the trimmed pool to lib/data/images.json.
import { readFileSync, writeFileSync } from "node:fs";

const pool = JSON.parse(readFileSync("lib/data/unsplash-images.json", "utf8"));
const CAP = 14;

async function ok(url) {
  try {
    const res = await fetch(url, { method: "GET", redirect: "follow" });
    return res.ok && (res.headers.get("content-type") || "").startsWith("image");
  } catch {
    return false;
  }
}

async function verifyList(list) {
  const out = [];
  // small concurrency
  for (let i = 0; i < list.length; i += 6) {
    const batch = list.slice(i, i + 6);
    const res = await Promise.all(batch.map((p) => ok(p.url)));
    batch.forEach((p, j) => res[j] && out.push(p));
  }
  return out;
}

const result = {};
for (const [bucket, items] of Object.entries(pool)) {
  const nonPremium = items.filter((p) => !p.premium);
  const premium = items.filter((p) => p.premium);
  // Verify non-premium first; only dip into premium if short.
  let kept = await verifyList(nonPremium);
  if (kept.length < CAP) {
    const more = await verifyList(premium.slice(0, (CAP - kept.length) * 2));
    kept = kept.concat(more);
  }
  result[bucket] = kept.slice(0, CAP).map(({ url, thumb, color, alt }) => ({
    url,
    thumb,
    color,
    alt,
  }));
  console.log(
    `${bucket.padEnd(12)} kept ${result[bucket].length} (np:${nonPremium.length} pr:${premium.length})`
  );
}

writeFileSync("lib/data/images.json", JSON.stringify(result, null, 2));
console.log("\nWrote lib/data/images.json");
console.log("Total:", Object.values(result).reduce((n, a) => n + a.length, 0));
