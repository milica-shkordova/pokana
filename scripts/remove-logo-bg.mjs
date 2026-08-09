import sharp from "sharp";
import path from "path";

const inputPath = path.resolve("public/assets/logo.png");
const outputPath = path.resolve("public/assets/logo-transparent.png");

const image = sharp(inputPath).ensureAlpha();
const { data, info } = await image.raw().toBuffer({ resolveWithObject: true });
const { width, height, channels } = info;

// Sample the background color from the four corners (averaged) — this logo
// has a flat, uniform background, so corners are a reliable sample.
function pixelAt(x, y) {
  const idx = (y * width + x) * channels;
  return [data[idx], data[idx + 1], data[idx + 2]];
}
const corners = [
  pixelAt(0, 0),
  pixelAt(width - 1, 0),
  pixelAt(0, height - 1),
  pixelAt(width - 1, height - 1),
];
const bg = [0, 1, 2].map(
  (c) => corners.reduce((sum, p) => sum + p[c], 0) / corners.length,
);

console.log("Detected background color:", bg.map(Math.round));

// The background here is near-white, so the classic GIMP-style
// color-to-alpha ratio ((p - b) / (255 - b)) has a tiny denominator and
// blows up to ~1.0 for any pixel that's even slightly brighter than the
// background — exactly what JPEG ringing near dark edges produces. Plain
// Euclidean distance from the background color doesn't have that blowup.
const MAX_DIST = 255 * Math.sqrt(3);
const rawAlpha = Buffer.alloc(width * height);
for (let i = 0; i < width * height; i++) {
  const idx = i * channels;
  const dr = data[idx] - bg[0];
  const dg = data[idx + 1] - bg[1];
  const db = data[idx + 2] - bg[2];
  const dist = Math.sqrt(dr * dr + dg * dg + db * db) / MAX_DIST;
  rawAlpha[i] = Math.round(dist * 255);
}

const denoisedAlpha = await sharp(rawAlpha, {
  raw: { width, height, channels: 1 },
})
  .median(5)
  .toColourspace("b-w")
  .raw()
  .toBuffer();

const LOW = 0.09;
const HIGH = 0.22;
function shapeAlpha(a) {
  return Math.min(1, Math.max(0, (a - LOW) / (HIGH - LOW)));
}

const out = Buffer.alloc(width * height * 4);
for (let i = 0; i < width * height; i++) {
  const idx = i * channels;
  const r = data[idx];
  const g = data[idx + 1];
  const b = data[idx + 2];

  const alpha = shapeAlpha(denoisedAlpha[i] / 255);

  // JPEG-style ringing right at high-contrast edges makes the per-pixel
  // "unblend" math (recovering true fg color from a bg/fg mix) overshoot
  // into bright halo dots. Just keep the original color and let the
  // (denoised) alpha alone carry the cutout — safer given this noisy source.
  const outIdx = i * 4;
  out[outIdx] = r;
  out[outIdx + 1] = g;
  out[outIdx + 2] = b;
  out[outIdx + 3] = Math.round(alpha * 255);
}

await sharp(out, { raw: { width, height, channels: 4 } })
  .png()
  .toFile(outputPath);

console.log("Wrote", outputPath);
