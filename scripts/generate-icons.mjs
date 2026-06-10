/**
 * Generates the raster brand icons from the vector mark:
 *   app/favicon.ico        16/32/48 (PNG-compressed ICO)
 *   app/apple-icon.png     180×180 (ringed monogram, full-bleed ink)
 *   public/icon-192.png    PWA manifest icon
 *   public/icon-512.png    PWA manifest icon
 *
 * Run with: node scripts/generate-icons.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const iconSvg = await readFile(path.join(root, "app/icon.svg"));

// Apple touch icon — Apple masks its own corners, so full-bleed square.
// Larger canvas leaves room for the circular monogram ring.
const appleSvg = Buffer.from(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 180 180">
  <rect width="180" height="180" fill="#17140f" />
  <circle cx="90" cy="90" r="62" fill="none" stroke="#f4f1eb" stroke-width="4" />
  <path
    d="M68 112 V72 L90 97 L112 72 V112"
    fill="none"
    stroke="#f4f1eb"
    stroke-width="7"
    stroke-linecap="square"
    stroke-linejoin="miter"
  />
</svg>
`);

const renderPng = (svg, size) =>
  sharp(svg, { density: 300 }).resize(size, size).png().toBuffer();

/** Pack PNG buffers into an ICO container (PNG entries, supported everywhere modern). */
function packIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);

  const dir = Buffer.alloc(16 * entries.length);
  let offset = header.length + dir.length;
  entries.forEach(({ size, png }, i) => {
    const o = i * 16;
    dir.writeUInt8(size >= 256 ? 0 : size, o); // width
    dir.writeUInt8(size >= 256 ? 0 : size, o + 1); // height
    dir.writeUInt8(0, o + 2); // palette
    dir.writeUInt8(0, o + 3); // reserved
    dir.writeUInt16LE(1, o + 4); // color planes
    dir.writeUInt16LE(32, o + 6); // bits per pixel
    dir.writeUInt32LE(png.length, o + 8);
    dir.writeUInt32LE(offset, o + 12);
    offset += png.length;
  });

  return Buffer.concat([header, dir, ...entries.map((e) => e.png)]);
}

const icoSizes = [16, 32, 48];
const icoEntries = await Promise.all(
  icoSizes.map(async (size) => ({ size, png: await renderPng(iconSvg, size) }))
);
await writeFile(path.join(root, "app/favicon.ico"), packIco(icoEntries));

await writeFile(path.join(root, "app/apple-icon.png"), await renderPng(appleSvg, 180));
await writeFile(path.join(root, "public/icon-192.png"), await renderPng(iconSvg, 192));
await writeFile(path.join(root, "public/icon-512.png"), await renderPng(iconSvg, 512));

console.log("Icons generated: favicon.ico, apple-icon.png, icon-192.png, icon-512.png");
