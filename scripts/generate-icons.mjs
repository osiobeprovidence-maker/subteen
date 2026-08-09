import zlib from 'node:zlib';
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = join(ROOT, 'public', 'icons');

const BG = [10, 10, 10];
const LIME = [184, 255, 77];
const WHITE = [245, 245, 245];

const S_GLYPH = ['11111', '10000', '10000', '11111', '00001', '00001', '11111'];

const FONT = {
  A: ['01110', '10001', '10001', '11111', '10001', '10001', '10001'],
  B: ['11110', '10001', '10001', '11110', '10001', '10001', '11110'],
  C: ['01111', '10000', '10000', '10000', '10000', '10000', '01111'],
  D: ['11110', '10001', '10001', '10001', '10001', '10001', '11110'],
  E: ['11111', '10000', '10000', '11110', '10000', '10000', '11111'],
  F: ['11111', '10000', '10000', '11110', '10000', '10000', '10000'],
  G: ['01111', '10000', '10000', '10111', '10001', '10001', '01111'],
  H: ['10001', '10001', '10001', '11111', '10001', '10001', '10001'],
  I: ['11111', '00100', '00100', '00100', '00100', '00100', '11111'],
  J: ['00111', '00010', '00010', '00010', '00010', '10010', '01100'],
  K: ['10001', '10010', '10100', '11000', '10100', '10010', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  N: ['10001', '11001', '10101', '10011', '10001', '10001', '10001'],
  O: ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  P: ['11110', '10001', '10001', '11110', '10000', '10000', '10000'],
  Q: ['01110', '10001', '10001', '10001', '10101', '10010', '01101'],
  R: ['11110', '10001', '10001', '11110', '10100', '10010', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  T: ['11111', '00100', '00100', '00100', '00100', '00100', '00100'],
  U: ['10001', '10001', '10001', '10001', '10001', '10001', '01110'],
  V: ['10001', '10001', '10001', '10001', '10001', '01010', '00100'],
  W: ['10001', '10001', '10001', '10101', '10101', '11011', '10001'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  Y: ['10001', '10001', '01010', '00100', '00100', '00100', '00100'],
  Z: ['11111', '00001', '00010', '00100', '01000', '10000', '11111'],
  0: ['01110', '10001', '10011', '10101', '11001', '10001', '01110'],
  1: ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  2: ['01110', '10001', '00001', '00010', '00100', '01000', '11111'],
  3: ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  4: ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  5: ['11111', '10000', '10000', '11110', '00001', '00001', '11110'],
  6: ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  7: ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  8: ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  9: ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
};

const WORDMARK = [
  { ch: 'S', color: WHITE },
  { ch: 'U', color: WHITE },
  { ch: 'B', color: WHITE },
  { ch: 'T', color: LIME },
  { ch: 'E', color: LIME },
  { ch: 'E', color: LIME },
  { ch: 'N', color: LIME },
];

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

function drawWordmark(buf, size, cell, topY) {
  const perLetter = 5 * cell;
  const totalW = WORDMARK.length * perLetter + (WORDMARK.length - 1) * cell;
  let x = Math.round((size - totalW) / 2);
  for (const { ch, color } of WORDMARK) {
    drawGlyph(buf, size, FONT[ch], x, Math.round(topY), cell, color);
    x += perLetter + cell;
  }
}

function renderIcon(size, { fullBleed = false, contentScale = 1 } = {}) {
  const buf = Buffer.alloc(size * size * 4, 0);
  if (fullBleed) {
    fillRect(buf, size, 0, 0, size, size, BG);
  } else {
    const m = Math.round(size * 0.03);
    fillRoundedRect(buf, size, m, m, size - m, size - m, Math.round(size * 0.22), BG);
  }

  const k = (size / 512) * contentScale;
  const sS = Math.max(3, Math.round(38 * k));
  const sT = Math.max(2, Math.round(7 * k));
  const gap = Math.max(3, Math.round(22 * k));
  const heroH = 7 * sS;
  const wordH = 7 * sT;
  const total = heroH + gap + wordH;
  const top = Math.round((size - total) / 2);

  drawGlyph(buf, size, S_GLYPH, Math.round((size - 5 * sS) / 2), top, sS, LIME);
  drawWordmark(buf, size, sT, top + heroH + gap);
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
