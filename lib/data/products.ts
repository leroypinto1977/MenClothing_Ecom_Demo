import type {
  Badge,
  CategorySlug,
  ColorOption,
  Fit,
  Product,
} from "@/lib/types";
import { photo } from "./images";

// ---- shared swatches -------------------------------------------------------
const C = {
  ink: { name: "Ink", hex: "#1c1a17" },
  charcoal: { name: "Charcoal", hex: "#3a3a3c" },
  navy: { name: "Navy", hex: "#2a3140" },
  slate: { name: "Slate", hex: "#5b6168" },
  olive: { name: "Olive", hex: "#5d5b45" },
  forest: { name: "Forest", hex: "#2f4034" },
  camel: { name: "Camel", hex: "#a9805a" },
  rust: { name: "Rust", hex: "#8a4a32" },
  sand: { name: "Sand", hex: "#cdbfa3" },
  oat: { name: "Oat", hex: "#d8cdb6" },
  bone: { name: "Bone", hex: "#ece6d8" },
  stone: { name: "Stone", hex: "#b9ae99" },
  white: { name: "Optic White", hex: "#f3f1ea" },
  ecru: { name: "Ecru", hex: "#e3dac6" },
  burgundy: { name: "Burgundy", hex: "#5a2a2f" },
  tan: { name: "Tan", hex: "#b48a60" },
} satisfies Record<string, ColorOption>;

const APPAREL = ["XS", "S", "M", "L", "XL", "XXL"];
const WAIST = ["28", "30", "32", "34", "36", "38"];
const ONE_SIZE = ["One Size"];
const SOFT = ["S", "M", "L"];

interface Concept {
  name: string;
  subtitle: string;
  price: number;
  compareAtPrice?: number;
  colors: ColorOption[];
  fit?: Fit;
  description: string;
  details: string[];
  badges?: Badge[];
  rating: number;
  reviewCount: number;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

// Convert the authored reference prices into realistic INR amounts
// (rounded to the nearest ₹100 for clean premium price points).
function toINR(value: number) {
  return Math.round((value * 80) / 100) * 100;
}

function build(
  category: CategorySlug,
  sizes: string[],
  defaultFit: Fit,
  concepts: Concept[]
): Product[] {
  const n = concepts.length;
  return concepts.map((c, i) => {
    const images = [0, n, 2 * n].map((off) => {
      const p = photo(category, i + off);
      return { url: p.url, thumb: p.thumb, alt: c.name };
    });
    return {
      id: `${category}-${i + 1}`,
      slug: slugify(c.name),
      name: c.name,
      subtitle: c.subtitle,
      category,
      price: toINR(c.price),
      compareAtPrice: c.compareAtPrice ? toINR(c.compareAtPrice) : undefined,
      colors: c.colors,
      sizes,
      images,
      description: c.description,
      details: c.details,
      fit: c.fit ?? defaultFit,
      rating: c.rating,
      reviewCount: c.reviewCount,
      badges: c.badges ?? [],
      relatedIds: [],
    };
  });
}

// ---- catalog ---------------------------------------------------------------

const shirts = build("shirts", APPAREL, "Regular", [
  {
    name: "The Garment-Dyed Oxford",
    subtitle: "Washed cotton button-down",
    price: 128,
    colors: [C.white, C.navy, C.olive, C.sand],
    description:
      "Our signature oxford, cut from heavyweight cotton and garment-dyed for a softened hand and lived-in colour from the first wear. A button-down collar holds its shape; a slightly relaxed body skims rather than clings.",
    details: [
      "100% organic long-staple cotton, 140 gsm",
      "Garment-dyed for depth of colour",
      "Mother-of-pearl buttons",
      "Machine wash cold, hang dry",
      "Woven in Portugal",
    ],
    badges: ["bestseller"],
    rating: 4.8,
    reviewCount: 214,
  },
  {
    name: "Linen Camp-Collar Shirt",
    subtitle: "Open-collar warm-weather shirt",
    price: 138,
    colors: [C.bone, C.olive, C.rust, C.slate],
    fit: "Relaxed",
    description:
      "A breathable European linen shirt with a soft camp collar that sits open or buttoned. Built for still summer evenings and everything that follows.",
    details: [
      "100% European washed linen",
      "Camp collar with chest pocket",
      "Corozo buttons",
      "Machine wash cold, cool iron",
      "Made in Portugal",
    ],
    badges: ["new"],
    rating: 4.7,
    reviewCount: 96,
  },
  {
    name: "Brushed Flannel Overshirt",
    subtitle: "Midweight shirt-jacket",
    price: 165,
    compareAtPrice: 195,
    colors: [C.forest, C.charcoal, C.burgundy],
    fit: "Relaxed",
    description:
      "Part shirt, part light jacket — brushed cotton flannel with a double chest pocket and a clean, boxy line. Layer it open over a tee or buttoned against the cold.",
    details: [
      "Brushed cotton flannel, 260 gsm",
      "Twin flap chest pockets",
      "Horn-look buttons",
      "Machine wash cold",
      "Woven in Portugal",
    ],
    badges: ["sale"],
    rating: 4.9,
    reviewCount: 142,
  },
  {
    name: "Fine Poplin Dress Shirt",
    subtitle: "Crisp tailored shirt",
    price: 118,
    colors: [C.white, C.slate, C.navy],
    fit: "Slim",
    description:
      "A clean cotton poplin with a refined point collar and a trim, tailored body. Sharp enough for the office, easy enough to wear untucked.",
    details: [
      "Two-ply 80s cotton poplin",
      "Single-needle tailoring",
      "Removable collar stays",
      "Machine wash, press as needed",
      "Made in Portugal",
    ],
    rating: 4.6,
    reviewCount: 58,
  },
  {
    name: "Corduroy Overshirt",
    subtitle: "Fine-wale cotton cord",
    price: 158,
    colors: [C.camel, C.olive, C.ink],
    fit: "Regular",
    description:
      "A fine 14-wale corduroy overshirt with a soft drape and a quietly retro collar. The kind of piece that earns a permanent spot in the rotation.",
    details: [
      "Fine-wale cotton corduroy",
      "Twin chest pockets",
      "Tonal buttons",
      "Machine wash cold, hang dry",
      "Woven in Portugal",
    ],
    badges: ["limited"],
    rating: 4.8,
    reviewCount: 73,
  },
]);

const tees = build("tees", APPAREL, "Regular", [
  {
    name: "Heavyweight Cotton Tee",
    subtitle: "Structured everyday crew",
    price: 52,
    colors: [C.white, C.ink, C.sand, C.olive, C.navy],
    description:
      "The tee we kept reaching for, so we made it the standard. A heavyweight 240 gsm cotton with enough body to hold its shape and a clean ribbed collar that won't stretch out.",
    details: [
      "100% combed cotton, 240 gsm",
      "Ribbed crew neckline",
      "Tubular body, no side seams",
      "Machine wash cold, tumble low",
      "Cut and sewn in Portugal",
    ],
    badges: ["bestseller"],
    rating: 4.9,
    reviewCount: 261,
  },
  {
    name: "Pima Pocket Tee",
    subtitle: "Soft-hand chest-pocket tee",
    price: 48,
    colors: [C.bone, C.slate, C.rust, C.forest],
    description:
      "Cut from buttery Peruvian Pima cotton with a single chest pocket and a slightly boxed shoulder. Light enough for summer, refined enough to layer.",
    details: [
      "100% Peruvian Pima cotton, 180 gsm",
      "Patch chest pocket",
      "Self-fabric collar",
      "Machine wash cold",
      "Made in Peru",
    ],
    badges: ["new"],
    rating: 4.7,
    reviewCount: 88,
  },
  {
    name: "Long-Sleeve Henley",
    subtitle: "Three-button waffle henley",
    price: 68,
    colors: [C.oat, C.charcoal, C.olive],
    description:
      "A waffle-knit henley with a clean three-button placket — the easy middle layer between tee and sweater. Textured, warm, and quietly versatile.",
    details: [
      "Cotton-modal waffle knit",
      "Three-button placket",
      "Ribbed cuffs",
      "Machine wash cold",
      "Made in Portugal",
    ],
    rating: 4.6,
    reviewCount: 64,
  },
  {
    name: "Slub Cotton V-Neck",
    subtitle: "Textured lightweight tee",
    price: 46,
    compareAtPrice: 58,
    colors: [C.white, C.stone, C.navy],
    description:
      "An airy slub-cotton v-neck with subtle texture and a flattering, open neckline. A warm-weather staple that wears beautifully on its own.",
    details: [
      "Slub cotton jersey, 150 gsm",
      "Reinforced v-neck",
      "Relaxed straight hem",
      "Machine wash cold",
      "Made in Portugal",
    ],
    badges: ["sale"],
    rating: 4.5,
    reviewCount: 41,
  },
]);

const knitwear = build("knitwear", APPAREL, "Regular", [
  {
    name: "Merino Crew Sweater",
    subtitle: "Fine-gauge everyday knit",
    price: 165,
    colors: [C.oat, C.navy, C.forest, C.charcoal, C.burgundy],
    description:
      "A fine 12-gauge extra-fine merino crew that breathes, resists odour and layers under everything. Soft enough to wear against the skin, refined enough for the office.",
    details: [
      "100% extra-fine merino wool",
      "12-gauge knit",
      "Ribbed collar, cuffs and hem",
      "Hand wash or dry clean",
      "Knitted in Italy",
    ],
    badges: ["bestseller"],
    rating: 4.9,
    reviewCount: 188,
  },
  {
    name: "Lambswool Half-Zip",
    subtitle: "Funnel-neck pullover",
    price: 188,
    colors: [C.stone, C.slate, C.olive],
    fit: "Regular",
    description:
      "A brushed lambswool half-zip with a funnel neck that stands up against the wind. Substantial without bulk — the cold-weather workhorse.",
    details: [
      "100% lambswool",
      "7-gauge brushed knit",
      "Matte metal zip pull",
      "Hand wash cold, dry flat",
      "Knitted in Scotland",
    ],
    badges: ["new"],
    rating: 4.8,
    reviewCount: 97,
  },
  {
    name: "Chunky Wool Cardigan",
    subtitle: "Shawl-collar heavy knit",
    price: 220,
    colors: [C.ecru, C.charcoal, C.rust],
    fit: "Relaxed",
    description:
      "A substantial shawl-collar cardigan in a chunky wool blend, with horn-look buttons and deep patch pockets. The piece you live in once the temperature drops.",
    details: [
      "Wool-blend chunky knit",
      "Shawl collar, patch pockets",
      "Horn-look buttons",
      "Dry clean only",
      "Knitted in Italy",
    ],
    badges: ["limited"],
    rating: 4.9,
    reviewCount: 71,
  },
  {
    name: "Cashmere Crewneck",
    subtitle: "Pure grade-A cashmere",
    price: 295,
    colors: [C.oat, C.ink, C.camel],
    description:
      "An indulgent two-ply grade-A cashmere crew with a clean line and a featherweight warmth. A quiet luxury that only gets softer with time.",
    details: [
      "100% grade-A Mongolian cashmere",
      "Two-ply, 12-gauge",
      "Fully fashioned seams",
      "Hand wash cold, dry flat",
      "Knitted in Italy",
    ],
    rating: 5.0,
    reviewCount: 54,
  },
  {
    name: "Fine-Gauge Rollneck",
    subtitle: "Merino turtleneck",
    price: 178,
    compareAtPrice: 210,
    colors: [C.charcoal, C.bone, C.navy],
    fit: "Slim",
    description:
      "A sleek merino rollneck that layers cleanly under a coat or stands alone. Fine-gauge and close-cut, with a fold-over neck that holds its shape.",
    details: [
      "100% extra-fine merino wool",
      "14-gauge knit",
      "Doubled rollneck",
      "Hand wash or dry clean",
      "Knitted in Italy",
    ],
    badges: ["sale"],
    rating: 4.7,
    reviewCount: 63,
  },
]);

const outerwear = build("outerwear", APPAREL, "Regular", [
  {
    name: "Wool Overcoat",
    subtitle: "Tailored double-faced coat",
    price: 495,
    colors: [C.charcoal, C.camel, C.navy],
    fit: "Tailored",
    description:
      "A timeless single-breasted overcoat in a double-faced Italian wool, cut long and lean with a clean notch lapel. The anchor of a cold-weather wardrobe.",
    details: [
      "Double-faced Italian wool blend",
      "Half-canvas construction",
      "Horn-look buttons",
      "Dry clean only",
      "Tailored in Portugal",
    ],
    badges: ["bestseller"],
    rating: 4.9,
    reviewCount: 116,
  },
  {
    name: "Waxed Field Jacket",
    subtitle: "Water-resistant utility jacket",
    price: 320,
    colors: [C.olive, C.ink, C.tan],
    fit: "Regular",
    description:
      "A waxed-cotton field jacket built to weather the seasons, with four utility pockets, a corduroy collar and a tartan-lined body. It only looks better with age.",
    details: [
      "Waxed British cotton",
      "Corduroy-trimmed collar",
      "Four bellows pockets",
      "Re-wax to refresh; spot clean",
      "Made in England",
    ],
    badges: ["new"],
    rating: 4.8,
    reviewCount: 84,
  },
  {
    name: "Quilted Liner Jacket",
    subtitle: "Lightweight diamond-quilt",
    price: 245,
    colors: [C.forest, C.charcoal, C.rust],
    description:
      "A diamond-quilted jacket with just enough loft to take the edge off — slips under a coat or stands alone on milder days. Snap front, corduroy collar.",
    details: [
      "Quilted recycled shell, lofted fill",
      "Snap-button placket",
      "Corduroy undercollar",
      "Machine wash cold, dry flat",
      "Made in Portugal",
    ],
    rating: 4.7,
    reviewCount: 59,
  },
  {
    name: "Suede Bomber",
    subtitle: "Goat-suede ribbed bomber",
    price: 520,
    compareAtPrice: 620,
    colors: [C.tan, C.ink],
    fit: "Regular",
    description:
      "A buttery goat-suede bomber with ribbed trims and a clean, minimal front. Supple, structured and quietly luxurious — a jacket to keep for a decade.",
    details: [
      "Premium goat suede",
      "Ribbed collar, cuffs and hem",
      "Two-way matte zip",
      "Professional leather clean only",
      "Made in Spain",
    ],
    badges: ["sale", "limited"],
    rating: 4.9,
    reviewCount: 38,
  },
]);

const trousers = build("trousers", WAIST, "Regular", [
  {
    name: "Pleated Wool Trouser",
    subtitle: "Single-pleat tailored trouser",
    price: 175,
    colors: [C.charcoal, C.navy, C.olive],
    fit: "Tailored",
    description:
      "A single-pleat trouser in a year-round Italian wool, cut with a clean taper and a touch of break. Dress them up with a rollneck or down with a tee.",
    details: [
      "Italian tropical wool",
      "Single forward pleat",
      "Extended tab closure",
      "Dry clean only",
      "Tailored in Portugal",
    ],
    badges: ["new"],
    rating: 4.8,
    reviewCount: 92,
  },
  {
    name: "Organic Cotton Chino",
    subtitle: "Garment-dyed straight chino",
    price: 118,
    colors: [C.sand, C.olive, C.ink, C.navy],
    description:
      "Our everyday chino in a garment-dyed organic cotton twill — broken-in soft, cut straight with a slight taper. The trouser you'll reach for on autopilot.",
    details: [
      "Organic cotton twill, garment-dyed",
      "Straight leg with slight taper",
      "Slant front pockets",
      "Machine wash cold",
      "Made in Portugal",
    ],
    badges: ["bestseller"],
    rating: 4.8,
    reviewCount: 174,
  },
  {
    name: "Five-Pocket Selvedge",
    subtitle: "Japanese selvedge denim",
    price: 168,
    colors: [C.navy, C.ink],
    fit: "Slim",
    description:
      "A 13.5 oz Japanese selvedge denim cut slim and clean, ready to fade to your own pattern of wear. Honest, hard-wearing, and made to age.",
    details: [
      "13.5 oz Japanese selvedge denim",
      "Five-pocket construction",
      "Tonal hardware",
      "Wash sparingly, inside out",
      "Made in Japan",
    ],
    rating: 4.7,
    reviewCount: 81,
  },
  {
    name: "Drawstring Lounge Trouser",
    subtitle: "Relaxed cotton-linen pant",
    price: 98,
    compareAtPrice: 120,
    colors: [C.stone, C.charcoal, C.olive],
    fit: "Relaxed",
    description:
      "An easy drawstring trouser in a cotton-linen blend with a relaxed leg and a tailored finish. Equal parts comfortable and considered.",
    details: [
      "Cotton-linen blend",
      "Elastic and drawstring waist",
      "Relaxed straight leg",
      "Machine wash cold",
      "Made in Portugal",
    ],
    badges: ["sale"],
    rating: 4.6,
    reviewCount: 47,
  },
]);

const accessories = build("accessories", ONE_SIZE, "Regular", [
  {
    name: "Bridle Leather Belt",
    subtitle: "Solid-brass buckle belt",
    price: 95,
    colors: [C.tan, C.ink],
    description:
      "A full-grain bridle leather belt with a solid brass buckle, finished by hand and burnished at the edges. Built to outlast the trends.",
    details: [
      "Full-grain English bridle leather",
      "Solid brass buckle",
      "Hand-finished edges",
      "Width 3.5 cm",
      "Made in England",
    ],
    badges: ["bestseller"],
    rating: 4.9,
    reviewCount: 132,
  },
  {
    name: "Lambswool Scarf",
    subtitle: "Woven double-faced scarf",
    price: 78,
    colors: [C.oat, C.charcoal, C.forest, C.burgundy],
    description:
      "A soft brushed lambswool scarf woven in Scotland, generously sized with fringed ends. The finishing touch that does the heavy lifting in winter.",
    details: [
      "100% brushed lambswool",
      "Hand-fringed ends",
      "180 × 30 cm",
      "Dry clean only",
      "Woven in Scotland",
    ],
    badges: ["new"],
    rating: 4.8,
    reviewCount: 69,
  },
  {
    name: "Leather Card Holder",
    subtitle: "Slim four-pocket wallet",
    price: 65,
    colors: [C.ink, C.tan],
    description:
      "A slim vegetable-tanned card holder with four pockets and a centre slip. Pared back to the essentials and made to patina beautifully.",
    details: [
      "Vegetable-tanned full-grain leather",
      "Four card pockets, centre slip",
      "Edge-painted by hand",
      "Patinas with use",
      "Made in Italy",
    ],
    rating: 4.7,
    reviewCount: 58,
  },
  {
    name: "Cotton Sock Trio",
    subtitle: "Ribbed everyday three-pack",
    price: 35,
    colors: [C.charcoal, C.navy, C.oat],
    fit: "Regular",
    description:
      "A three-pack of ribbed combed-cotton socks with a cushioned sole and a stay-up cuff. The quiet upgrade you feel every day.",
    details: [
      "Combed cotton blend",
      "Cushioned footbed",
      "Reinforced heel and toe",
      "Three pairs, assorted neutrals",
      "Made in Portugal",
    ],
    badges: ["bestseller"],
    rating: 4.8,
    reviewCount: 203,
  },
  {
    name: "Waxed Canvas Holdall",
    subtitle: "Weekend duffle bag",
    price: 245,
    compareAtPrice: 290,
    colors: [C.olive, C.tan],
    description:
      "A roomy waxed-canvas holdall with leather trims and a detachable shoulder strap — sized for a long weekend and built to take the miles.",
    details: [
      "Waxed cotton canvas, leather trim",
      "Detachable shoulder strap",
      "Internal zip pocket",
      "48 × 28 × 26 cm",
      "Made in England",
    ],
    badges: ["sale", "limited"],
    rating: 4.9,
    reviewCount: 44,
  },
]);

export const products: Product[] = [
  ...shirts,
  ...tees,
  ...knitwear,
  ...outerwear,
  ...trousers,
  ...accessories,
];

// Fill related products with same-category siblings.
for (const p of products) {
  p.relatedIds = products
    .filter((o) => o.category === p.category && o.id !== p.id)
    .slice(0, 4)
    .map((o) => o.id);
}

// ---- accessors -------------------------------------------------------------

export function getProductBySlug(slug: string): Product | undefined {
  return products.find((p) => p.slug === slug);
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function getProductsByCategory(category: CategorySlug): Product[] {
  return products.filter((p) => p.category === category);
}

export function getRelated(product: Product): Product[] {
  return product.relatedIds
    .map((id) => getProductById(id))
    .filter((p): p is Product => Boolean(p));
}

export function getNewArrivals(limit = 8): Product[] {
  return products.filter((p) => p.badges.includes("new")).slice(0, limit);
}

export function getBestsellers(limit = 8): Product[] {
  return products.filter((p) => p.badges.includes("bestseller")).slice(0, limit);
}

export function getOnSale(limit = 8): Product[] {
  return products.filter((p) => p.compareAtPrice).slice(0, limit);
}

export function searchProducts(query: string): Product[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return products.filter(
    (p) =>
      p.name.toLowerCase().includes(q) ||
      p.subtitle.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.colors.some((c) => c.name.toLowerCase().includes(q))
  );
}

export const allColors: ColorOption[] = Object.values(C);
export const allSizes = APPAREL;
export { SOFT };
