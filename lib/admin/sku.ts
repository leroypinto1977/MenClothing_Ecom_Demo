/** SKU format shared by the seed script and the admin variant sync. */
export function skuFor(productId: string, color: string, size: string) {
  const norm = (v: string) =>
    v.toUpperCase().replace(/[^A-Z0-9]+/g, "").slice(0, 8);
  return `MER-${productId.toUpperCase()}-${norm(color)}-${norm(size)}`;
}
