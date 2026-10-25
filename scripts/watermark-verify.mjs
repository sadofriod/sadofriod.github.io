#!/usr/bin/env node
import sharp from 'sharp';
import { scanWatermark } from '../lib/watermark.ts';

const imagePath = process.argv[2];
if (!imagePath) {
  console.error('Usage: node --experimental-strip-types scripts/watermark-verify.mjs <image path> [--width 1600]');
  process.exit(2);
}
const widthIndex = process.argv.indexOf('--width');
const requestedWidth = widthIndex >= 0 ? Number(process.argv[widthIndex + 1]) : undefined;
try {
  const { data, info } = await sharp(imagePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const widths = requestedWidth ? Array.from(new Set([requestedWidth, 2000, 1600, 1200, 900, 700])) : undefined;
  const hit = scanWatermark(data, info.width, info.height, info.channels,
    widths);
  if (!hit.crcOk) {
    console.log(`NO WATERMARK (best confidence ${hit.confidence.toFixed(2)}) id=${hit.idHex || 'none'} crcOk=false confidence=${hit.confidence.toFixed(2)} width=${hit.width}`);
  } else {
    console.log(`id=${hit.idHex} crcOk=true confidence=${hit.confidence.toFixed(2)} width=${hit.width} watermarkId: ${hit.idHex}`);
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
