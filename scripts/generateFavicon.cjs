const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

function crc32(buf) {
  const table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const toHash = Buffer.concat([typeBuf, data]);
  crcBuf.writeUInt32BE(crc32(toHash), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height) {
  const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA color type
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdr = makeChunk('IHDR', ihdrData);

  const rowLen = 1 + width * 4;
  const raw = Buffer.alloc(rowLen * height);

  const A = [
    [0, 1, 1, 1, 0],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ];
  const M = [
    [1, 0, 0, 0, 1],
    [1, 1, 0, 1, 1],
    [1, 0, 1, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
    [1, 0, 0, 0, 1],
  ];

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLen;
    raw[rowOffset] = 0; // Filter None
    for (let x = 0; x < width; x++) {
      const pOffset = rowOffset + 1 + x * 4;

      // Background: #080B12
      let r = 8, g = 11, b = 18, a = 255;

      // Rounded corner anti-aliasing / transparency
      const isCorner =
        (x < 3 && y < 3 && (3 - x) * (3 - x) + (3 - y) * (3 - y) > 9) ||
        (x >= width - 3 && y < 3 && (x - (width - 4)) * (x - (width - 4)) + (3 - y) * (3 - y) > 9) ||
        (x < 3 && y >= height - 3 && (3 - x) * (3 - x) + (y - (height - 4)) * (y - (height - 4)) > 9) ||
        (x >= width - 3 && y >= height - 3 && (x - (width - 4)) * (x - (width - 4)) + (y - (height - 4)) * (y - (height - 4)) > 9);

      if (isCorner) {
        a = 0;
      } else {
        // Border: #263244
        if (x === 0 || y === 0 || x === width - 1 || y === height - 1) {
          r = 38; g = 50; b = 68;
        }

        // 'A' bitmap scaled at (x: 5..14, y: 9..22)
        const ax = Math.floor((x - 5) / 2);
        const ay = Math.floor((y - 9) / 2);
        if (ax >= 0 && ax < 5 && ay >= 0 && ay < 7 && A[ay][ax]) {
          r = 56; g = 189; b = 248; // Cyan #38BDF8
        }

        // 'M' bitmap scaled at (x: 17..26, y: 9..22)
        const mx = Math.floor((x - 17) / 2);
        const my = Math.floor((y - 9) / 2);
        if (mx >= 0 && mx < 5 && my >= 0 && my < 7 && M[my][mx]) {
          r = 129; g = 140; b = 248; // Indigo #818CF8
        }

        // Accent dot at (28, 22)
        if (x >= 27 && x <= 28 && y >= 21 && y <= 22) {
          r = 56; g = 189; b = 248;
        }
      }

      raw[pOffset] = r;
      raw[pOffset + 1] = g;
      raw[pOffset + 2] = b;
      raw[pOffset + 3] = a;
    }
  }

  const idatData = zlib.deflateSync(raw);
  const idat = makeChunk('IDAT', idatData);
  const iend = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([sig, ihdr, idat, iend]);
}

const publicDir = path.resolve(__dirname, '..', 'public');
fs.mkdirSync(publicDir, { recursive: true });

const png = createPng(32, 32);
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png);

// ICO wrapper for 32x32 PNG
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0); // Reserved
icoHeader.writeUInt16LE(1, 2); // 1 = Icon type
icoHeader.writeUInt16LE(1, 4); // 1 image count

const icoDir = Buffer.alloc(16);
icoDir[0] = 32; // Width
icoDir[1] = 32; // Height
icoDir[2] = 0;  // Palette count
icoDir[3] = 0;  // Reserved
icoDir.writeUInt16LE(1, 4);  // Color planes
icoDir.writeUInt16LE(32, 6); // Bits per pixel
icoDir.writeUInt32LE(png.length, 8); // Size of PNG data
icoDir.writeUInt32LE(22, 12); // Offset = 6 + 16 = 22

const ico = Buffer.concat([icoHeader, icoDir, png]);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), ico);
console.log('Favicons generated in public/ successfully!');
