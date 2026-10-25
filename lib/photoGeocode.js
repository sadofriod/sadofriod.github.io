import { getGeocodeCache, putGeocodeCache } from './photoStore.js';

const LANGUAGES = { en: 'en', zh: 'zh-Hans', ja: 'ja', ko: 'ko', es: 'es' };
const clean = (value) => typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';

function record(latitude, longitude, city, region, country, provider) {
  city = clean(city) || null;
  region = clean(region) || null;
  country = clean(country) || null;
  const parts = [...new Set([city, region, country].filter(Boolean))];
  return { latitude, longitude, label: parts.length ? parts.join(', ') : null, city, region, country, provider };
}

async function nominatim(lat, lon, lang, fetchImpl) {
  const url = new URL('https://nominatim.openstreetmap.org/reverse');
  for (const [key, value] of Object.entries({ format: 'jsonv2', zoom: '14', addressdetails: '1', lat, lon, 'accept-language': lang })) {
    url.searchParams.set(key, String(value));
  }
  const response = await fetchImpl(url, {
    headers: { 'user-agent': 'ashesborn-blog-photos/1.0 (+https://blog.ashesborn.cloud)', accept: 'application/json' },
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error(`Nominatim returned ${response.status}`);
  const address = (await response.json()).address;
  if (!address || typeof address !== 'object') throw new Error('Nominatim response has no address');
  return record(lat, lon,
    address.city || address.town || address.village || address.municipality || address.county || address.state_district,
    address.state,
    address.country,
    'nominatim');
}

async function bigdatacloud(lat, lon, lang, fetchImpl) {
  const url = new URL('https://api.bigdatacloud.net/data/reverse-geocode-client');
  url.searchParams.set('latitude', String(lat));
  url.searchParams.set('longitude', String(lon));
  url.searchParams.set('localityLanguage', lang);
  const response = await fetchImpl(url, { headers: { accept: 'application/json' }, signal: AbortSignal.timeout(8000) });
  if (!response.ok) throw new Error(`BigDataCloud returned ${response.status}`);
  const data = await response.json();
  return record(lat, lon, data.city || data.locality, data.principalSubdivision, data.countryName, 'bigdatacloud');
}

export async function reverseGeocode(lat, lon, { env = {}, db, lang, fetchImpl = globalThis.fetch, now = () => new Date() } = {}) {
  const latitude = Number(lat);
  const longitude = Number(lon);
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
    return { latitude: Number.isFinite(latitude) ? latitude : null, longitude: Number.isFinite(longitude) ? longitude : null, label: null, city: null, region: null, country: null, provider: null };
  }
  // Language is part of the key: the cached value is a localised label, so a zh lookup
  // must not hand a Japanese visitor Chinese place names.
  const key = `${latitude.toFixed(3)},${longitude.toFixed(3)},${LANGUAGES[lang] || 'en'}`;
  try {
    const selected = env.GEOCODE_PROVIDER || 'nominatim';
    if (selected === 'off') return record(latitude, longitude, null, null, null, null);
    let cached = null;
    try {
      cached = db ? await getGeocodeCache(db, key) : null;
    } catch {
      // A cache read outage should not prevent a provider lookup.
    }
    if (cached) {
      const created = Date.parse(String(cached.createdAt).replace(' ', 'T') + (String(cached.createdAt).includes('Z') ? '' : 'Z'));
      const current = typeof now === 'function' ? now() : now;
      const ttl = cached.label ? 90 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
      if (Number.isFinite(created) && current instanceof Date && current.getTime() - created < ttl) {
        return { latitude, longitude, label: cached.label ?? null, city: cached.city ?? null, region: cached.region ?? null,
          country: cached.country ?? null, provider: cached.provider ?? null };
      }
    }
    const provider = selected === 'bigdatacloud' ? 'bigdatacloud' : 'nominatim';
    const providers = provider === 'nominatim' ? [nominatim, bigdatacloud] : [bigdatacloud, nominatim];
    let result = null;
    for (const resolve of providers) {
      try {
        result = await resolve(latitude, longitude, LANGUAGES[lang] || 'en', fetchImpl);
        break;
      } catch {
        // One provider fallback keeps transient errors from blocking the upload form.
      }
    }
    result ||= record(latitude, longitude, null, null, null, null);
    // A miss is cached too, but only for a day: providers rate-limit and time out,
    // and a 90-day negative cache would keep a transient outage permanent.
    if (db) {
      try {
        const current = typeof now === 'function' ? now() : now;
        await putGeocodeCache(db, key, { ...result, createdAt: current instanceof Date ? current.toISOString() : new Date().toISOString() });
      } catch {
        // The geocode answer remains useful even if D1 is unavailable for this write.
      }
    }
    return result;
  } catch {
    return record(latitude, longitude, null, null, null, null);
  }
}
