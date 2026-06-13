// Static site content only. Products, reviews, orders and users now live in
// Postgres — read them via lib/db/queries.ts. The legacy files (products.ts,
// reviews.ts, orders.ts, user.ts) remain solely as seed sources for
// scripts/seed.ts and must not be imported by the storefront.
export * from "./categories";
export * from "./images";
