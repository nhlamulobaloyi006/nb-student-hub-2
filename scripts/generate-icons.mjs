import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SRC = path.join(__dirname, "..", "public", "logos", "logo.png");
const OUT = path.join(__dirname, "..", "public", "icons");

const SIZES = [192, 512];

for (const size of SIZES) {
  const out = path.join(OUT, "icon-" + size + ".png");
  await sharp(SRC)
    .resize(size, size, { fit: "contain", background: { r: 10, g: 14, b: 26, alpha: 0 } })
    .png()
    .toFile(out);
  console.log("OK: " + out);
}
console.log("Done.");
