// Harvests menswear photo URLs from Unsplash's public search endpoint and writes
// a curated, de-duplicated pool to lib/data/unsplash-images.json.
// Re-run any time to refresh imagery: `node scripts/harvest-images.mjs`
import { writeFileSync, mkdirSync } from "node:fs";

const QUERIES = {
  shirts: ["mens oxford shirt", "mens linen shirt", "mens dress shirt"],
  tees: ["mens plain t-shirt", "mens white tshirt minimal", "mens tshirt studio"],
  knitwear: ["mens knit sweater", "mens wool jumper", "mens cardigan neutral"],
  outerwear: ["mens overcoat wool", "mens jacket fashion", "mens trench coat"],
  trousers: ["mens tailored trousers", "mens chinos fashion", "mens pants studio"],
  accessories: ["mens leather belt", "mens watch minimal", "mens sunglasses fashion"],
  hero: ["menswear editorial fashion", "men minimal fashion neutral"],
  lifestyle: ["mens fashion studio portrait", "men style neutral tones", "menswear lookbook"],
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Pull the stable "photo-xxxx" (or "premium_photo-xxxx") slug from a raw URL.
function slugFrom(url) {
  const m = url.match(/\/(premium_photo-[\w-]+|photo-[\w-]+)\?/);
  return m ? m[1] : null;
}

function cleanUrl(slug, ixid, w = 1100) {
  if (slug.startsWith("premium_photo")) {
    // Premium photos require the ixid token to hotlink.
    return `https://plus.unsplash.com/${slug}?ixid=${ixid}&ixlib=rb-4.1.0&auto=format&fit=crop&w=${w}&q=80`;
  }
  return `https://images.unsplash.com/${slug}?auto=format&fit=crop&w=${w}&q=80`;
}

async function search(query) {
  const url = `https://unsplash.com/napi/search/photos?query=${encodeURIComponent(
    query
  )}&per_page=24&orientation=portrait`;
  const res = await fetch(url, { headers: { Accept: "application/json" } });
  if (!res.ok) {
    console.error(`  ! ${query} -> HTTP ${res.status}`);
    return [];
  }
  const json = await res.json();
  return json.results ?? [];
}

const pool = {};
const seen = new Set();

for (const [bucket, queries] of Object.entries(QUERIES)) {
  pool[bucket] = [];
  for (const q of queries) {
    const results = await search(q);
    for (const r of results) {
      const raw = r?.urls?.raw ?? "";
      const slug = slugFrom(raw);
      if (!slug || seen.has(slug)) continue;
      // Prefer real product-ish shots: skip very wide/tiny.
      seen.add(slug);
      const ixid = (raw.match(/ixid=([\w-]+)/) || [])[1] || "";
      pool[bucket].push({
        slug,
        url: cleanUrl(slug, ixid, bucket === "hero" ? 1600 : 1100),
        thumb: cleanUrl(slug, ixid, 600),
        color: r?.color ?? "#e5e1d8",
        alt: r?.alternative_slugs?.en?.replace(/-[\w]{6,}$/, "").replace(/-/g, " ") ?? bucket,
        premium: slug.startsWith("premium_photo"),
      });
    }
    await sleep(400);
  }
  console.log(`${bucket.padEnd(12)} ${pool[bucket].length} photos`);
}

mkdirSync("lib/data", { recursive: true });
writeFileSync("lib/data/unsplash-images.json", JSON.stringify(pool, null, 2));
console.log("\nWrote lib/data/unsplash-images.json");
console.log("Total:", Object.values(pool).reduce((n, a) => n + a.length, 0));
