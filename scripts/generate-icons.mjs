import zlib from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'icons');

// Original Subteen favicon/logo: neon lime (#B8FF4D) tile with a black "S".
const LIME = [184, 255, 77];
const BLACK = [0, 0, 0];

const S_GLYPH = ['11111', '10000', '10000', '11111', '00001', '00001', '11111'];

function fillPixel(buf, size, x, y, [r, g, b]) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const i = (y * size + x) * 4;
  buf[i] = r;
  buf[i + 1] = g;
  buf[i + 2] = b;
  buf[i + 3] = 255;
}

function fillRect(buf, size, x, y, w, h, color) {
  for (let j = y; j < y + h; j++) {
    for (let i = x; i < x + w; i++) fillPixel(buf, size, i, j, color);
  }
}

function fillRoundedRect(buf, size, x0, y0, x1, y1, rad, color) {
  for (let y = y0; y <= y1; y++) {
    for (let x = x0; x <= x1; x++) {
      const cx = Math.max(x0 + rad, Math.min(x, x1 - rad));
      const cy = Math.max(y0 + rad, Math.min(y, y1 - rad));
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy > rad * rad) continue;
      fillPixel(buf, size, x, y, color);
    }
  }
}

function drawGlyph(buf, size, glyph, x, y, cell, color) {
  for (let row = 0; row < 7; row++) {
    for (let col = 0; col < 5; col++) {
      if (glyph[row][col] === '1') {
        fillRect(buf, size, x + col * cell, y + row * cell, cell, cell, color);
      }
    }
  }
}

function renderIcon(size, { fullBleed = false, contentScale = 1 } = {}) {
  const buf = Buffer.alloc(size * size * 4, 0);
  if (fullBleed) {
    fillRect(buf, size, 0, 0, size, size, LIME);
  } else {
    const m = Math.round(size * 0.02);
    fillRoundedRect(buf, size, m, m, size - m, size - m, Math.round(size * 0.22), LIME);
  }

  const k = (size / 512) * contentScale;
  const cell = Math.max(3, Math.round(50 * k));
  const left = Math.round((size - 5 * cell) / 2);
  const top = Math.round((size - 7 * cell) / 2);
  drawGlyph(buf, size, S_GLYPH, left, top, cell, BLACK);
  return buf;
}

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePNG(size, rgba) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const stride = size * 4;
  const raw = Buffer.alloc((stride + 1) * size);
  for (let y = 0; y < size; y++) {
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', idat), chunk('IEND', Buffer.alloc(0))]);
}

const TARGETS = [
  { file: 'icon-512.png', size: 512, opts: {} },
  { file: 'icon-192.png', size: 192, opts: {} },
  { file: 'icon-512-maskable.png', size: 512, opts: { fullBleed: true } },
  { file: 'icon-192-maskable.png', size: 192, opts: { fullBleed: true } },
  { file: 'apple-touch-icon.png', size: 180, opts: { fullBleed: true, contentScale: 0.92 } },
];

mkdirSync(OUT_DIR, { recursive: true });
for (const { file, size, opts } of TARGETS) {
  const png = encodePNG(size, renderIcon(size, opts));
  writeFileSync(join(OUT_DIR, file), png);
  console.log(`wrote ${file} (${size}x${size}, ${png.length} bytes)`);
}
