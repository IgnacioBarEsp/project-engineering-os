import { deflateSync } from 'node:zlib';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Draws the application icon from the interface's own orbit motif and palette, with no font and no
// image dependency, then writes a multi-size Windows icon. Run it when the mark or palette changes:
// `node scripts/build-icon.mjs`. The produced build/icon.ico is committed so packaging is offline.
const SUPER = 4, BASE = 256, SIZE = BASE * SUPER;
const DARK = [0x14, 0x25, 0x1b], GREEN = [0x36, 0x7d, 0x57], MINT = [0xdc, 0xeb, 0xdd];
const RADIUS = 56 * SUPER;

const canvas = new Float64Array(SIZE * SIZE * 4);
function paint(x, y, colour, alpha) {
  if (alpha <= 0) return;
  const i = (y * SIZE + x) * 4, keep = 1 - alpha;
  canvas[i] = canvas[i] * keep + colour[0] * alpha;
  canvas[i + 1] = canvas[i + 1] * keep + colour[1] * alpha;
  canvas[i + 2] = canvas[i + 2] * keep + colour[2] * alpha;
  canvas[i + 3] = canvas[i + 3] * keep + 255 * alpha;
}
// Rounded square ground.
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    const dx = Math.max(RADIUS - x, x - (SIZE - 1 - RADIUS), 0), dy = Math.max(RADIUS - y, y - (SIZE - 1 - RADIUS), 0);
    if (Math.hypot(dx, dy) <= RADIUS) paint(x, y, DARK, 1);
  }
}
// Concentric orbit: one upright ring plus the two flattened rings the interface already uses.
const centre = (SIZE - 1) / 2;
const rings = [
  { a: 84 * SUPER, b: 84 * SUPER, angle: 0, width: 7 * SUPER, colour: MINT },
  { a: 84 * SUPER, b: 42 * SUPER, angle: 40, width: 5 * SUPER, colour: GREEN },
  { a: 84 * SUPER, b: 42 * SUPER, angle: -40, width: 5 * SUPER, colour: GREEN },
];
for (const ring of rings) {
  const radians = (ring.angle * Math.PI) / 180, cos = Math.cos(radians), sin = Math.sin(radians);
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const px = x - centre, py = y - centre;
      const rx = px * cos + py * sin, ry = -px * sin + py * cos;
      // Approximate distance to the ellipse outline, then keep a constant-width stroke.
      const value = Math.hypot(rx / ring.a, ry / ring.b);
      if (value === 0) continue;
      const distance = Math.abs(value - 1) * Math.min(ring.a, ring.b);
      if (distance <= ring.width / 2) paint(x, y, ring.colour, 1);
    }
  }
}
// Centre mark.
for (let y = 0; y < SIZE; y++) {
  for (let x = 0; x < SIZE; x++) {
    if (Math.hypot(x - centre, y - centre) <= 17 * SUPER) paint(x, y, MINT, 1);
  }
}

function downsample(size) {
  const step = SIZE / size, out = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      for (let sy = Math.floor(y * step); sy < Math.floor((y + 1) * step); sy++) {
        for (let sx = Math.floor(x * step); sx < Math.floor((x + 1) * step); sx++) {
          const i = (sy * SIZE + sx) * 4;
          r += canvas[i]; g += canvas[i + 1]; b += canvas[i + 2]; a += canvas[i + 3]; count++;
        }
      }
      const o = (y * size + x) * 4;
      out[o] = Math.round(r / count); out[o + 1] = Math.round(g / count);
      out[o + 2] = Math.round(b / count); out[o + 3] = Math.round(a / count);
    }
  }
  return out;
}

const TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc32 = buffer => {
  let c = 0xffffffff;
  for (const byte of buffer) c = TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
function chunk(type, data) {
  const length = Buffer.alloc(4); length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}
function png(size, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0); header.writeUInt32BE(size, 4);
  header[8] = 8; header[9] = 6; header[10] = 0; header[11] = 0; header[12] = 0;
  const raw = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    rgba.copy(raw, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  }
  return Buffer.concat([Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header), chunk('IDAT', deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

const sizes = [256, 128, 64, 48, 32, 16];
const images = sizes.map(size => ({ size, png: png(size, downsample(size)) }));
const directory = Buffer.alloc(6 + images.length * 16);
directory.writeUInt16LE(0, 0); directory.writeUInt16LE(1, 2); directory.writeUInt16LE(images.length, 4);
let offset = directory.length;
images.forEach((image, index) => {
  const entry = 6 + index * 16;
  directory[entry] = image.size >= 256 ? 0 : image.size;
  directory[entry + 1] = image.size >= 256 ? 0 : image.size;
  directory[entry + 2] = 0; directory[entry + 3] = 0;
  directory.writeUInt16LE(1, entry + 4); directory.writeUInt16LE(32, entry + 6);
  directory.writeUInt32LE(image.png.length, entry + 8);
  directory.writeUInt32LE(offset, entry + 12);
  offset += image.png.length;
});
const icon = Buffer.concat([directory, ...images.map(image => image.png)]);
const target = path.join(fileURLToPath(new URL('../', import.meta.url)), 'build', 'icon.ico');
await writeFile(target, icon);
console.log(JSON.stringify({ icon: target, bytes: icon.length, sizes }, null, 2));
