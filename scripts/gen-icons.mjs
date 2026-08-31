// Generates PWA icons (dark background, barbell glyph) as real PNGs with no deps.
import { deflateSync } from 'node:zlib'
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons')
mkdirSync(outDir, { recursive: true })

const CRC_TABLE = new Int32Array(256).map((_, n) => {
  let c = n
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
  return c
})
const crc32 = (buf) => {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}
const chunk = (type, data) => {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function writePng(path, size, pixelAt) {
  const raw = Buffer.alloc(size * (size * 3 + 1))
  for (let y = 0; y < size; y++) {
    const row = y * (size * 3 + 1)
    raw[row] = 0 // filter: none
    for (let x = 0; x < size; x++) {
      const [r, g, b] = pixelAt(x, y, size)
      const i = row + 1 + x * 3
      raw[i] = r
      raw[i + 1] = g
      raw[i + 2] = b
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(size, 0)
  ihdr.writeUInt32BE(size, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 2 // color type: truecolor
  const png = Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ])
  writeFileSync(path, png)
  console.log('wrote', path, png.length, 'bytes')
}

const BG = [15, 17, 21] // #0f1115
const BAR = [251, 191, 36] // amber #fbbf24
const PLATE = [232, 234, 240] // near-white

// Barbell laid horizontally across the center, in coordinates relative to size.
function barbellPixel(x, y, size) {
  const u = x / size
  const v = y / size
  const inRect = (x0, x1, y0, y1) => u >= x0 && u <= x1 && v >= y0 && v <= y1
  // bar
  if (inRect(0.1, 0.9, 0.465, 0.535)) return BAR
  // inner plates (taller)
  if (inRect(0.24, 0.32, 0.26, 0.74)) return PLATE
  if (inRect(0.68, 0.76, 0.26, 0.74)) return PLATE
  // outer plates (shorter)
  if (inRect(0.15, 0.21, 0.34, 0.66)) return PLATE
  if (inRect(0.79, 0.85, 0.34, 0.66)) return PLATE
  return BG
}

writePng(join(outDir, 'icon-192.png'), 192, barbellPixel)
writePng(join(outDir, 'icon-512.png'), 512, barbellPixel)
writePng(join(outDir, 'apple-touch-icon.png'), 180, barbellPixel)
