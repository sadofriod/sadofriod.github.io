#!/usr/bin/env node
import { parsePhotoMetadata, metadataToFormFields, summarizeMetadata } from '../lib/photoMetadata.ts';

const failures = [];
const check = (label, condition, detail = '') => {
  if (condition) console.log(`  ok   ${label}`);
  else { failures.push(label); console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ''}`); }
};

function makeTiff({ little = true, make = 'NIKON CORPORATION', model = 'NIKON Z 6', southern = false } = {}) {
  const chunks = [];
  const u16 = (n) => little ? [n & 255, n >> 8 & 255] : [n >> 8 & 255, n & 255];
  const u32 = (n) => little ? [n & 255, n >> 8 & 255, n >> 16 & 255, n >> 24 & 255] : [n >> 24 & 255, n >> 16 & 255, n >> 8 & 255, n & 255];
  const put = (offset, bytes) => { for (let i = 0; i < bytes.length; i += 1) chunks[offset + i] = bytes[i]; };
  const ascii = (text) => [...new TextEncoder().encode(`${text}\0`)];
  const rational = (n, d = 1) => [...u32(n), ...u32(d)];
  const entry = (tag, type, count, inlineOrOffset) => [...u16(tag), ...u16(type), ...u32(count), ...u32(inlineOrOffset)];

  // IFD0 @ 8; ExifIFD @ 200; GPSIFD @ 360; out-of-line values from @ 500.
  put(0, [little ? 0x49 : 0x4d, little ? 0x49 : 0x4d, ...u16(42), ...u32(8)]);
  const ifd0 = [
    entry(0x010f, 2, ascii(make).length, 500),
    entry(0x0110, 2, ascii(model).length, 520),
    entry(0x0112, 3, 1, little ? 1 : 0x00010000),
    entry(0x8769, 4, 1, 200),
    entry(0x8825, 4, 1, 360),
    entry(0x9c9d, 7, 44, 540),
  ];
  put(8, [...u16(ifd0.length), ...ifd0.flat(), ...u32(0)]);
  const exif = [
    entry(0x9003, 2, ascii('2024:05:01 17:32:07').length, 600),
    entry(0x9011, 2, ascii('+08:00').length, 620),
    entry(0x829a, 5, 1, 640), entry(0x829d, 5, 1, 648),
    entry(0x8827, 3, 1, little ? 400 : 0x01900000),
    entry(0x920a, 5, 1, 656), entry(0xa434, 2, ascii('NIKKOR Z 24-70mm f/2.8 S').length, 664),
  ];
  put(200, [...u16(exif.length), ...exif.flat(), ...u32(0)]);
  const gps = [
    entry(1, 2, 2, southern ? 0x0053 : 0x004e), entry(2, 5, 3, 700),
    entry(3, 2, 2, southern ? 0x0057 : 0x0045), entry(4, 5, 3, 724),
    entry(5, 1, 1, 0), entry(6, 5, 1, 748),
  ];
  put(360, [...u16(gps.length), ...gps.flat(), ...u32(0)]);
  put(500, ascii(make)); put(520, ascii(model));
  const xp = [...new TextEncoder().encode('travel;night;hangzhou;')].flatMap((c) => [c, 0]);
  put(540, xp);
  put(600, ascii('2024:05:01 17:32:07')); put(620, ascii('+08:00'));
  put(640, rational(1, 250)); put(648, rational(28, 10)); put(656, rational(35)); put(664, ascii('NIKKOR Z 24-70mm f/2.8 S'));
  put(700, rational(30)); put(708, rational(16)); put(716, rational(2664, 100));
  put(724, rational(120)); put(732, rational(9)); put(740, rational(1308, 100)); put(748, rational(8));
  return new Uint8Array(chunks);
}

function jpeg(tiff) { return new Uint8Array([0xff, 0xd8, 0xff, 0xe1, (tiff.length + 8) >> 8, (tiff.length + 8) & 255, ...new TextEncoder().encode('Exif\0\0'), ...tiff, 0xff, 0xd9]); }
function png(tiff) {
  return new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, ...[(tiff.length >>> 24) & 255, (tiff.length >>> 16) & 255, (tiff.length >>> 8) & 255, tiff.length & 255], ...new TextEncoder().encode('eXIf'), ...tiff, 0, 0, 0, 0]);
}
function webp(tiff) {
  const length = tiff.length + 8;
  return new Uint8Array([...new TextEncoder().encode('RIFF'), ...[length & 255, length >> 8 & 255, length >> 16 & 255, length >> 24 & 255], ...new TextEncoder().encode('WEBP'), ...new TextEncoder().encode('EXIF'), tiff.length & 255, tiff.length >> 8 & 255, tiff.length >> 16 & 255, tiff.length >> 24 & 255, ...tiff, ...(tiff.length & 1 ? [0] : [])]);
}

const fixture = jpeg(makeTiff());
const meta = parsePhotoMetadata(fixture);
check('JPEG EXIF parses date and capture wall-clock', meta?.takenAt === '2024-05-01' && meta.takenAtRaw === '2024-05-01 17:32:07');
check('GPS DMS converts to decimal coordinates', Math.abs((meta?.latitude ?? 0) - 30.274067) < 1e-4 && Math.abs((meta?.longitude ?? 0) - 120.153633) < 1e-4);
check('GPS altitude and camera make/model clean', meta?.altitude === 8 && meta.cameraMake === 'NIKON CORPORATION' && meta.cameraModel === 'NIKON Z 6');
check('lens and exposure settings parse', meta?.lens === 'NIKKOR Z 24-70mm f/2.8 S' && meta.fNumber === 2.8 && meta.exposureTime === '1/250' && meta.iso === 400 && meta.focalLength === 35);
check('XPKeywords parse and deduplicate', JSON.stringify(meta?.keywords) === '["travel","night","hangzhou"]', JSON.stringify(meta?.keywords));
const fields = metadataToFormFields(meta);
check('metadata form fields round-trip', fields.takenOn === '2024-05-01' && fields.tags === 'travel,night,hangzhou' && fields.latitude === String(meta.latitude));
check('metadata summary includes date, camera, and coordinate chips', summarizeMetadata(meta).some((chip) => chip === '2024-05-01') && summarizeMetadata(meta).some((chip) => chip.includes('NIKON Z 6')) && summarizeMetadata(meta).some((chip) => chip.includes('30.274')));
check('PNG eXIf container parses', parsePhotoMetadata(png(makeTiff()))?.cameraModel === 'NIKON Z 6');
check('WebP EXIF container parses', parsePhotoMetadata(webp(makeTiff()))?.cameraModel === 'NIKON Z 6');
const bigEndian = new Uint8Array([0x4d, 0x4d, 0, 42, 0, 0, 0, 8, 0, 1, 0x01, 0x12, 0, 3, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0]);
check('big-endian minimal IFD parses', parsePhotoMetadata(jpeg(bigEndian))?.orientation === 1);
check('empty bytes return null', parsePhotoMetadata(new Uint8Array()) === null);
check('random bytes return null', parsePhotoMetadata(new Uint8Array([1, 2, 3, 4, 5])) === null);
check('truncated APP1 does not throw', (() => { try { parsePhotoMetadata(fixture.slice(0, 22)); return true; } catch { return false; } })());
check('JPEG without APP1 returns null', parsePhotoMetadata(new Uint8Array([0xff, 0xd8, 0xff, 0xd9])) === null);
const southWest = parsePhotoMetadata(jpeg(makeTiff({ southern: true })));
check('southern and western refs become negative', (southWest?.latitude ?? 0) < 0 && (southWest?.longitude ?? 0) < 0);

if (failures.length) process.exit(1);
console.log('\nall photo metadata checks passed');
