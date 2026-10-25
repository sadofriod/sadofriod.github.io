export const WATERMARK_VERSION = 1;
export const WATERMARK_STRENGTH = 40;

const BLOCK = 8;
const PAYLOAD_BYTES = 11;
const C0 = Math.sqrt(1 / 8);
const C = Math.sqrt(2 / 8);
const basis = Array.from({ length: 8 }, (_, u) =>
  Float64Array.from({ length: 8 }, (_, x) => (u === 0 ? C0 : C) * Math.cos(((2 * x + 1) * u * Math.PI) / 16))
);

export function buildPayload(idBytes: Uint8Array): Uint8Array {
  if (idBytes.length !== 8) throw new Error('Watermark id must be exactly 8 bytes');
  let crc = 0xffff;
  for (let byteIndex = 0; byteIndex < idBytes.length; byteIndex += 1) {
    const byte = idBytes[byteIndex];
    crc ^= byte << 8;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) & 0xffff : (crc << 1) & 0xffff;
  }
  const payload = new Uint8Array(PAYLOAD_BYTES);
  payload.set(idBytes);
  payload[8] = crc >>> 8;
  payload[9] = crc & 255;
  payload[10] = WATERMARK_VERSION;
  return payload;
}

export function readPayload(bytes: Uint8Array): { idHex: string; crcOk: boolean; version: number } | null {
  if (bytes.length < PAYLOAD_BYTES) return null;
  const payload = buildPayload(bytes.subarray(0, 8));
  const crcOk = payload[8] === bytes[8] && payload[9] === bytes[9];
  return {
    idHex: Array.from(bytes.subarray(0, 8), (byte) => byte.toString(16).padStart(2, '0')).join(''),
    crcOk,
    version: bytes[10],
  };
}

const pixelIndex = (x: number, y: number, width: number, height: number, channels: number, length: number) => {
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 0 || y < 0 || x >= width || y >= height) return -1;
  const index = (y * width + x) * channels;
  return index >= 0 && index + channels <= length ? index : -1;
};

function coefficientPair(pixels: Uint8Array | Uint8ClampedArray, width: number, height: number, channels: number,
  blockX: number, blockY: number, scratch: Float64Array): [number, number, number] {
  let first = 0;
  let second = 0;
  let sum = 0;
  let count = 0;
  for (let y = 0; y < BLOCK; y += 1) {
    for (let x = 0; x < BLOCK; x += 1) {
      const px = blockX + x;
      const py = blockY + y;
      if (px >= width || py >= height) continue;
      const index = pixelIndex(px, py, width, height, channels, pixels.length);
      if (index < 0) continue;
      const value = channels === 1 ? pixels[index] :
        0.299 * pixels[index] + 0.587 * pixels[index + 1] + 0.114 * pixels[index + 2];
      scratch[y * BLOCK + x] = value;
      sum += value;
      count += 1;
      first += value * basis[1][x] * basis[4][y];
      second += value * basis[4][x] * basis[1][y];
    }
  }
  if (count === 0) return [0, 0, 0];
  const mean = sum / count;
  let variance = 0;
  for (let index = 0; index < 64; index += 1) variance += (scratch[index] - mean) ** 2;
  return [first, second, Math.sqrt(variance / count)];
}

function changeCoefficient(pixels: Uint8Array | Uint8ClampedArray, width: number, height: number, channels: number,
  blockX: number, blockY: number, u: number, v: number, delta: number): number {
  let changed = 0;
  for (let y = 0; y < BLOCK; y += 1) {
    for (let x = 0; x < BLOCK; x += 1) {
      const px = blockX + x;
      const py = blockY + y;
      if (px >= width || py >= height) continue;
      const index = pixelIndex(px, py, width, height, channels, pixels.length);
      if (index < 0) continue;
      const amount = delta * basis[u][x] * basis[v][y];
      for (let channel = 0; channel < Math.min(channels, 3); channel += 1) {
        const previous = pixels[index + channel];
        const next = Math.max(0, Math.min(255, Math.round(previous + amount)));
        pixels[index + channel] = next;
        if (next !== previous) changed += 1;
      }
    }
  }
  return changed;
}

/**
 * Flat blocks (a clear sky, a painted wall) carry no mid-frequency energy, so a coefficient
 * relation cannot survive there: forcing one would paint a visible 8x8 pattern. Both sides skip
 * blocks below this luma standard deviation, which keeps the bit order identical.
 */
const TEXTURE_MIN_VARIANCE = 6;

export function embedWatermark(pixels: Uint8Array | Uint8ClampedArray, width: number, height: number,
  channels: number, payload: Uint8Array, strength = WATERMARK_STRENGTH): { blocks: number; changed: number } {
  if ((channels !== 3 && channels !== 4) || !Number.isInteger(width) || !Number.isInteger(height) || width < 8 || height < 8) {
    throw new Error('Invalid image dimensions or channels');
  }
  if (payload.length === 0) throw new Error('Watermark payload is empty');
  const scratch = new Float64Array(64);
  const blocksPerRow = Math.floor(width / 8);
  let blocks = 0;
  let changed = 0;
  for (let by = 0, y = 0; y + 8 <= height; y += 8, by += 1) {
    for (let bx = 0, x = 0; x + 8 <= width; x += 8, bx += 1) {
      // The bit index comes from the grid position, never from how many blocks passed the
      // texture test: a block that flips its flat/textured verdict (compression nudges the
      // variance) must not shift every later block's bit.
      const position = by * blocksPerRow + bx;
      const [first, second, variance] = coefficientPair(pixels, width, height, channels, x, y, scratch);
      if (variance < TEXTURE_MIN_VARIANCE) continue;
      const bit = (payload[Math.floor(position / 8) % payload.length] >> (7 - (position % 8))) & 1;
      const signFirst = first < 0 ? -1 : 1;
      const signSecond = second < 0 ? -1 : 1;
      const magnitudeFirst = Math.abs(first);
      const magnitudeSecond = Math.abs(second);
      const distance = bit ? magnitudeFirst - magnitudeSecond : magnitudeSecond - magnitudeFirst;
      if (distance < strength) {
        // Both magnitudes must stay >= 0 while differing by `strength`, otherwise a pair of
        // near-zero coefficients ends up with equal magnitudes and the bit cannot be read back.
        const mean = (magnitudeFirst + magnitudeSecond) / 2;
        const quiet = Math.max(0, mean - strength / 2);
        const loud = quiet + strength;
        const firstTarget = bit ? loud : quiet;
        const secondTarget = bit ? quiet : loud;
        changed += changeCoefficient(pixels, width, height, channels, x, y, 1, 4, signFirst * (firstTarget - magnitudeFirst));
        changed += changeCoefficient(pixels, width, height, channels, x, y, 4, 1, signSecond * (secondTarget - magnitudeSecond));
      }
      blocks += 1;
    }
  }
  return { blocks, changed };
}

function extractAt(pixels: Uint8Array | Uint8ClampedArray, width: number, height: number, channels: number,
  payloadBytes: number, offsetX: number, offsetY: number) {
  const bitCount = payloadBytes * 8;
  const ones = new Uint32Array(bitCount);
  const totals = new Uint32Array(bitCount);
  const scratch = new Float64Array(64);
  const blocksPerRow = Math.floor(width / 8);
  let blocks = 0;
  for (let by = 0, y = offsetY; y + 8 <= height; y += 8, by += 1) {
    for (let bx = 0, x = offsetX; x + 8 <= width; x += 8, bx += 1) {
      const [a, b, variance] = coefficientPair(pixels, width, height, channels, x, y, scratch);
      if (variance < TEXTURE_MIN_VARIANCE) continue;
      const bitIndex = (by * blocksPerRow + bx) % bitCount;
      if (Math.abs(a) > Math.abs(b)) ones[bitIndex] += 1;
      totals[bitIndex] += 1;
      blocks += 1;
    }
  }
  const bytes = new Uint8Array(payloadBytes);
  let confidence = 0;
  for (let bit = 0; bit < bitCount; bit += 1) {
    const total = totals[bit];
    const yes = ones[bit];
    if (yes > total / 2) bytes[Math.floor(bit / 8)] |= 1 << (7 - (bit % 8));
    confidence += total ? Math.max(yes, total - yes) / total : 0.5;
  }
  const payload = readPayload(bytes);
  return { idHex: payload?.idHex ?? '', crcOk: payload?.crcOk ?? false, confidence: confidence / bitCount, blocks };
}

export function extractWatermark(pixels: Uint8Array | Uint8ClampedArray, width: number, height: number,
  channels: number, payloadBytes = PAYLOAD_BYTES): { idHex: string; crcOk: boolean; confidence: number; blocks: number } {
  if ((channels !== 3 && channels !== 4) || !Number.isInteger(width) || !Number.isInteger(height) || payloadBytes < 1) {
    throw new Error('Invalid image dimensions, channels, or payload length');
  }
  return extractAt(pixels, width, height, channels, payloadBytes, 0, 0);
}

function resizeBox(pixels: Uint8Array | Uint8ClampedArray, width: number, height: number, channels: number,
  targetWidth: number, offsetX: number, offsetY: number) {
  const targetHeight = Math.max(1, Math.round(height * targetWidth / width));
  const output = new Uint8ClampedArray(targetWidth * targetHeight * channels);
  const scaleX = width / targetWidth;
  const scaleY = height / targetHeight;
  const sums = new Float64Array(channels);
  for (let y = 0; y < targetHeight; y += 1) {
    const y0 = Math.max(0, y * scaleY + offsetY);
    const y1 = Math.min(height, (y + 1) * scaleY + offsetY);
    for (let x = 0; x < targetWidth; x += 1) {
      const x0 = Math.max(0, x * scaleX + offsetX);
      const x1 = Math.min(width, (x + 1) * scaleX + offsetX);
      const startX = Math.floor(x0);
      const endX = Math.ceil(x1);
      const startY = Math.floor(y0);
      const endY = Math.ceil(y1);
      let weightSum = 0;
      sums.fill(0);
      for (let sy = startY; sy < endY; sy += 1) {
        if (sy >= height) continue;
        const wy = Math.max(0, Math.min(y1, sy + 1) - Math.max(y0, sy));
        for (let sx = startX; sx < endX; sx += 1) {
          if (sx >= width) continue;
          const wx = Math.max(0, Math.min(x1, sx + 1) - Math.max(x0, sx));
          const weight = wx * wy;
          const index = pixelIndex(sx, sy, width, height, channels, pixels.length);
          if (index < 0) continue;
          weightSum += weight;
          for (let c = 0; c < channels; c += 1) sums[c] += pixels[index + c] * weight;
        }
      }
      const index = (y * targetWidth + x) * channels;
      if (weightSum) for (let c = 0; c < channels; c += 1) output[index + c] = sums[c] / weightSum;
    }
  }
  return { pixels: output, width: targetWidth, height: targetHeight };
}

const OFFSETS: Array<[number, number]> = [[0, 0], [1, 0], [0, 1], [1, 1]];

export function scanWatermark(pixels: Uint8Array | Uint8ClampedArray, width: number, height: number,
  channels: number, widths = [2000, 1600, 1200, 900, 700]): { idHex: string; crcOk: boolean; confidence: number; width: number } {
  // A preview that was never resized carries the watermark on its own 8x8 grid, and the grid
  // width is whatever the source frame was (not necessarily one of `widths`). Try that first.
  let best = { idHex: '', crcOk: false, confidence: 0.5, width };
  for (const [offsetX, offsetY] of OFFSETS) {
    const hit = extractAt(pixels, width, height, channels, PAYLOAD_BYTES, offsetX, offsetY);
    if ((hit.crcOk && !best.crcOk) || (hit.crcOk === best.crcOk && hit.confidence > best.confidence)) {
      best = { ...hit, width };
    }
    if (best.crcOk) return best;
  }

  const attempts = [...widths].sort((a, b) => Math.abs(a - width) - Math.abs(b - width));
  for (const requestedWidth of attempts) {
    const targetWidth = Math.max(1, requestedWidth);
    const resized = resizeBox(pixels, width, height, channels, targetWidth, 0, 0);
    for (const [offsetX, offsetY] of OFFSETS) {
      {
        const hit = extractAt(resized.pixels, resized.width, resized.height, channels, PAYLOAD_BYTES, offsetX, offsetY);
        if ((hit.crcOk && !best.crcOk) || (hit.crcOk === best.crcOk && hit.confidence > best.confidence)) {
          best = { ...hit, width: targetWidth };
        }
        if (hit.crcOk && hit.confidence === 1) return best;
      }
    }
  }
  return best;
}
