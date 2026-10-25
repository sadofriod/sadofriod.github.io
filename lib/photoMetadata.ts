export type PhotoMetadata = {
  takenAt?: string;
  takenAtRaw?: string;
  offsetTime?: string;
  latitude?: number;
  longitude?: number;
  altitude?: number;
  cameraMake?: string;
  cameraModel?: string;
  lens?: string;
  fNumber?: number;
  exposureTime?: string;
  iso?: number;
  focalLength?: number;
  orientation?: number;
  keywords: string[];
  description?: string;
  software?: string;
};

type Entry = { type: number; count: number; value: number; data: unknown };

const cleanText = (value: string, limit = 240) =>
  value.replace(/\0+$/g, '').replace(/[\0\s]+/g, ' ').trim().slice(0, limit);

function extractTiff(bytes: Uint8Array): Uint8Array | null {
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const text = (offset: number, value: string) =>
    offset >= 0 && offset + value.length <= view.byteLength &&
    Array.from(value, (char, index) => view.getUint8(offset + index) === char.charCodeAt(0)).every(Boolean);

  try {
    if (text(0, 'Exif\0\0')) return bytes.subarray(6);
    if (text(0, '\xff\xd8')) {
      let offset = 2;
      while (offset + 4 <= view.byteLength) {
        if (view.getUint8(offset) !== 0xff) break;
        const marker = view.getUint8(offset + 1);
        if (marker === 0xda || marker === 0xd9) break;
        const length = view.getUint16(offset + 2, false);
        if (length < 2 || offset + 2 + length > view.byteLength) break;
        if (marker === 0xe1 && text(offset + 4, 'Exif\0\0')) return bytes.subarray(offset + 10, offset + 2 + length);
        offset += length + 2;
      }
      return null;
    }
    if (text(0, '\x89PNG\r\n\x1a\n')) {
      let offset = 8;
      while (offset + 12 <= view.byteLength) {
        const length = view.getUint32(offset, false);
        if (length > view.byteLength - offset - 12) break;
        if (text(offset + 4, 'eXIf')) return bytes.subarray(offset + 8, offset + 8 + length);
        offset += length + 12;
      }
      return null;
    }
    if (text(0, 'RIFF') && text(8, 'WEBP')) {
      let offset = 12;
      while (offset + 8 <= view.byteLength) {
        const length = view.getUint32(offset + 4, true);
        if (length > view.byteLength - offset - 8) break;
        if (text(offset, 'EXIF')) {
          const chunk = bytes.subarray(offset + 8, offset + 8 + length);
          return chunk.length >= 6 && new TextDecoder().decode(chunk.subarray(0, 6)) === 'Exif\0\0'
            ? chunk.subarray(6)
            : chunk;
        }
        offset += 8 + length + (length & 1);
      }
      return null;
    }
    // AVIF/HEIC ISO-BMFF Exif item-location parsing is intentionally best-effort unsupported.
  } catch {
    return null;
  }
  return null;
}

function parseTiff(tiff: Uint8Array): PhotoMetadata | null {
  const view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  if (view.byteLength < 8) return null;
  const little = view.getUint8(0) === 0x49 && view.getUint8(1) === 0x49;
  if (!little && !(view.getUint8(0) === 0x4d && view.getUint8(1) === 0x4d)) return null;
  if (view.getUint16(2, little) !== 42) return null;

  const sizeOf: Record<number, number> = { 1: 1, 2: 1, 3: 2, 4: 4, 5: 8, 6: 1, 7: 1, 8: 2, 9: 4, 10: 8, 11: 4, 12: 8 };
  const readIFD = (offset: number): Map<number, Entry> => {
    const result = new Map<number, Entry>();
    if (!Number.isInteger(offset) || offset < 8 || offset + 2 > view.byteLength) return result;
    const count = view.getUint16(offset, little);
    if (count > 4096 || offset + 2 + count * 12 > view.byteLength) return result;
    for (let i = 0; i < count; i += 1) {
      const entryOffset = offset + 2 + i * 12;
      const tag = view.getUint16(entryOffset, little);
      const type = view.getUint16(entryOffset + 2, little);
      const number = view.getUint32(entryOffset + 4, little);
      const unit = sizeOf[type];
      if (!unit || number > 1_000_000) continue;
      const byteLength = number * unit;
      const dataOffset = byteLength <= 4 ? entryOffset + 8 : view.getUint32(entryOffset + 8, little);
      if (dataOffset < 0 || byteLength > view.byteLength - dataOffset) continue;
      const values: number[] = [];
      const strings: number[] = [];
      for (let j = 0; j < number; j += 1) {
        const p = dataOffset + j * unit;
        if (type === 2 || type === 7 || type === 1 || type === 6) strings.push(view.getUint8(p));
        if (type === 1 || type === 7) values.push(view.getUint8(p));
        else if (type === 6) values.push(view.getInt8(p));
        else if (type === 3) values.push(view.getUint16(p, little));
        else if (type === 8) values.push(view.getInt16(p, little));
        else if (type === 4) values.push(view.getUint32(p, little));
        else if (type === 9) values.push(view.getInt32(p, little));
        else if (type === 5 || type === 10) {
          const numerator = type === 5 ? view.getUint32(p, little) : view.getInt32(p, little);
          const denominator = type === 5 ? view.getUint32(p + 4, little) : view.getInt32(p + 4, little);
          values.push(denominator === 0 ? NaN : numerator / denominator);
        } else if (type === 11) values.push(view.getFloat32(p, little));
        else if (type === 12) values.push(view.getFloat64(p, little));
      }
      const data = type === 2 ? cleanText(String.fromCharCode(...strings.slice(0, 4096))) :
        (type === 7 ? strings : values.length === 1 ? values[0] : values);
      result.set(tag, { type, count: number, value: dataOffset, data });
    }
    return result;
  };

  try {
    const ifd0Offset = view.getUint32(4, little);
    const ifd0 = readIFD(ifd0Offset);
    if (ifd0.size === 0) return null;
    const exif = readIFD(Number(ifd0.get(0x8769)?.data ?? 0));
    const gps = readIFD(Number(ifd0.get(0x8825)?.data ?? 0));
    const get = (directory: Map<number, Entry>, tag: number) => directory.get(tag)?.data;
    const string = (value: unknown) => typeof value === 'string' ? cleanText(value) : '';
    const number = (value: unknown) => typeof value === 'number' && Number.isFinite(value) ? value : undefined;
    const rationalArray = (value: unknown) => Array.isArray(value) ? value as number[] : value === undefined ? [] : [value as number];
    const date = [get(exif, 0x9003), get(exif, 0x9004), get(ifd0, 0x0132)]
      .map(string).find((value) => /^\d{4}:\d{2}:\d{2} \d{2}:\d{2}:\d{2}$/.test(value) && !/^0{4}:/.test(value));
    const dateParts = date?.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}:\d{2}:\d{2})$/);
    const validDate = dateParts && (() => {
      const [, year, month, day, time] = dateParts;
      const [hour, minute, second] = time.split(':').map(Number);
      const parsed = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day), hour, minute, second));
      return parsed.getUTCFullYear() === Number(year) && parsed.getUTCMonth() === Number(month) - 1 &&
        parsed.getUTCDate() === Number(day) && hour < 24 && minute < 60 && second < 60;
    })();
    const make = string(get(ifd0, 0x010f));
    let model = string(get(ifd0, 0x0110));
    if (make && !/^Apple\s/i.test(model) && model.toLowerCase().startsWith(make.toLowerCase() + ' ')) model = model.slice(make.length).trim();
    model = cleanText(model, 80);

    const coordinate = (refValue: unknown, dmsValue: unknown, max: number) => {
      const ref = string(refValue).toUpperCase();
      const dms = rationalArray(dmsValue);
      if (dms.length < 3 || dms.some((part) => typeof part !== 'number' || !Number.isFinite(part))) return undefined;
      let result = dms[0] + dms[1] / 60 + dms[2] / 3600;
      if (ref === 'S' || ref === 'W') result = -result;
      if (Math.abs(result) > max) return undefined;
      return Number(result.toFixed(6));
    };
    const latitude = coordinate(get(gps, 1), get(gps, 2), 90);
    const longitude = coordinate(get(gps, 3), get(gps, 4), 180);
    const altitudeRaw = number(get(gps, 6));
    const altitudeRef = number(get(gps, 5));
    const rawExposure = number(get(exif, 0x829a));
    let exposureTime: string | undefined;
    if (rawExposure !== undefined && rawExposure > 0) {
      if (rawExposure < 1) {
        const denominator = Math.round(1 / rawExposure);
        exposureTime = denominator > 0 && Math.abs(1 / denominator - rawExposure) <= Math.max(0.0005, rawExposure * 0.04)
          ? `1/${denominator}`
          : String(Number(rawExposure.toPrecision(4)));
      } else exposureTime = String(Number(rawExposure.toPrecision(4)));
    }
    const getKeywords = (tag: number) => {
      const entry = ifd0.get(tag);
      if (!entry) return [];
      if (tag === 0x9c9d || tag === 0x9c9f) {
        const chars = entry.data as number[];
        let decoded = '';
        for (let i = 0; i + 1 < chars.length; i += 2) decoded += String.fromCharCode(chars[i] | (chars[i + 1] << 8));
        return decoded.split(';');
      }
      if (Array.isArray(entry.data)) return [cleanText(String.fromCharCode(...entry.data.slice(0, 4096)))];
      return string(entry.data).split(';');
    };
    const keywords: string[] = [];
    const seen = new Set<string>();
    for (const keyword of [...getKeywords(0x9c9d), ...getKeywords(0x9c9f)]) {
      const value = cleanText(keyword, 40);
      const key = value.toLocaleLowerCase();
      if (value && !seen.has(key) && keywords.length < 10) { seen.add(key); keywords.push(value); }
    }
    let userComment = '';
    const comment = exif.get(0x9286)?.data;
    if (Array.isArray(comment)) {
      const chars = comment as number[];
      const body = chars.slice(8);
      userComment = cleanText(new TextDecoder('utf-8').decode(new Uint8Array(body)));
    }
    const lens = [string(get(exif, 0xa433)), string(get(exif, 0xa434))].filter(Boolean).join(' ').trim();
    const metadata: PhotoMetadata = {
      ...(validDate ? { takenAt: `${dateParts[1]}-${dateParts[2]}-${dateParts[3]}`, takenAtRaw: `${dateParts[1]}-${dateParts[2]}-${dateParts[3]} ${dateParts[4]}` } : {}),
      ...(string(get(exif, 0x9011)) || string(get(exif, 0x9010)) ? { offsetTime: string(get(exif, 0x9011)) || string(get(exif, 0x9010)) } : {}),
      ...(latitude !== undefined ? { latitude } : {}), ...(longitude !== undefined ? { longitude } : {}),
      ...(altitudeRaw !== undefined ? { altitude: altitudeRef === 1 ? -altitudeRaw : altitudeRaw } : {}),
      ...(make ? { cameraMake: cleanText(make, 80) } : {}), ...(model ? { cameraModel: model } : {}),
      ...(lens ? { lens: cleanText(lens, 80) } : {}),
      ...(number(get(exif, 0x829d)) !== undefined ? { fNumber: number(get(exif, 0x829d)) } : {}),
      ...(exposureTime ? { exposureTime } : {}),
      ...(number(get(exif, 0x8827)) !== undefined ? { iso: number(get(exif, 0x8827)) } : {}),
      ...(number(get(exif, 0x920a)) !== undefined ? { focalLength: number(get(exif, 0x920a)) } : {}),
      ...(number(get(ifd0, 0x0112)) !== undefined ? { orientation: number(get(ifd0, 0x0112)) } : {}),
      keywords,
      ...(string(get(ifd0, 0x010e)) ? { description: string(get(ifd0, 0x010e)) } : {}),
      ...(string(get(ifd0, 0x0131)) ? { software: string(get(ifd0, 0x0131)) } : {}),
      ...(userComment ? { description: userComment } : {}),
    };
    const { keywords: _keywords, ...fields } = metadata;
    return Object.keys(fields).length || keywords.length ? metadata : null;
  } catch {
    return null;
  }
}

export function parsePhotoMetadata(bytes: Uint8Array): PhotoMetadata | null {
  try {
    if (!(bytes instanceof Uint8Array) || bytes.length === 0) return null;
    const tiff = extractTiff(bytes);
    return tiff ? parseTiff(tiff) : null;
  } catch {
    return null;
  }
}

export function metadataToFormFields(meta: PhotoMetadata): Record<string, string> {
  const fields: Record<string, string> = {};
  const values: Record<string, string | number | undefined> = {
    takenOn: meta.takenAt, tags: meta.keywords.join(','), latitude: meta.latitude, longitude: meta.longitude,
    altitude: meta.altitude, cameraMake: meta.cameraMake, cameraModel: meta.cameraModel, lens: meta.lens,
    fNumber: meta.fNumber, exposureTime: meta.exposureTime, iso: meta.iso, focalLength: meta.focalLength,
  };
  for (const [key, value] of Object.entries(values)) if (value !== undefined && String(value).trim()) fields[key] = String(value);
  return fields;
}

export function summarizeMetadata(meta: PhotoMetadata): string[] {
  const chips: string[] = [];
  if (meta.takenAt) chips.push(meta.takenAt);
  const make = meta.cameraMake?.replace(/\s+(corporation|corp\.?|inc\.?|co\.?|ltd\.?)$/i, '').trim();
  const model = meta.cameraModel?.trim();
  const camera = model && make && model.toLowerCase().startsWith(make.toLowerCase() + ' ')
    ? model
    : [make, model].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim();
  if (camera) chips.push(camera);
  if (typeof meta.latitude === 'number' && typeof meta.longitude === 'number') {
    chips.push(`${Math.abs(meta.latitude)}°${meta.latitude < 0 ? 'S' : 'N'} ${Math.abs(meta.longitude)}°${meta.longitude < 0 ? 'W' : 'E'}`);
  }
  if (meta.lens) chips.push(meta.lens);
  const exposure = [
    meta.fNumber ? `f/${meta.fNumber}` : '',
    meta.exposureTime ? `${meta.exposureTime}s` : '',
    meta.iso ? `ISO ${meta.iso}` : '',
    meta.focalLength ? `${meta.focalLength}mm` : '',
  ].filter(Boolean).join(' · ');
  if (exposure) chips.push(exposure);
  return chips;
}
