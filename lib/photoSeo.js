import { listPhotos } from './photoStore.js';

const PHOTO_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const HEAD_TTL = 10 * 60 * 1000;
let cachedHeadFragment = '';
let cachedHeadAt = 0;

const text = (value) => value === null || value === undefined ? '' : String(value).trim();
const html = (value) => text(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
const xml = (value) => html(value);
const jsonLd = (value) => JSON.stringify(value).replace(/</g, '\\u003c');
const absolute = (base, path) => new URL(path, base).href;

function baseFor(request, env) {
  return (env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin).replace(/\/$/, '');
}

function photoLabel(photo) {
  return text(photo.title) || text(photo.location?.city) || text(photo.takenOn) || 'Photograph';
}

function photoPlace(photo) {
  return [photo.location?.city, photo.location?.region, photo.location?.country]
    .map(text).filter(Boolean).join(', ') || text(photo.location?.label);
}

function cameraName(photo) {
  return [photo.camera?.make, photo.camera?.model].map(text).filter(Boolean).join(' ');
}

function description(photo) {
  const place = photoPlace(photo);
  const parts = [
    place ? `Photograph from ${place}` : '',
    photo.takenOn ? `taken on ${text(photo.takenOn)}` : '',
    cameraName(photo) ? `captured with ${cameraName(photo)}` : '',
    photo.tags?.length ? `Keywords: ${photo.tags.map(text).filter(Boolean).join(', ')}` : '',
  ].filter(Boolean);
  return parts.length ? `${parts.join('; ')}.` : `A photograph from the Ashes Born photography gallery.`;
}

function scaledDimensions(photo) {
  const width = Number(photo.width) || 0;
  const height = Number(photo.height) || 0;
  if (width <= 0 || height <= 0) return { width, height };
  const scale = Math.min(1, 1600 / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

function metadataRows(photo) {
  const camera = cameraName(photo);
  const exposure = [
    photo.camera?.fNumber ? `f/${photo.camera.fNumber}` : '',
    photo.camera?.exposureTime ? `${photo.camera.exposureTime}s` : '',
  ].filter(Boolean).join(' · ');
  const rows = [
    ['Date', photo.takenOn], ['Place', photoPlace(photo)], ['Camera', camera],
    ['Lens', photo.camera?.lens], ['Exposure', exposure], ['ISO', photo.camera?.iso],
    ['Focal length', photo.camera?.focalLength ? `${photo.camera.focalLength}mm` : ''],
    ['Keywords', photo.tags?.join(', ')],
  ].filter(([, value]) => text(value));
  return `<dl>${rows.map(([label, value]) => `<dt>${html(label)}</dt><dd>${html(value)}</dd>`).join('')}</dl>`;
}

async function stylesheetFragment(request, env) {
  if (cachedHeadAt && Date.now() - cachedHeadAt < HEAD_TTL) return cachedHeadFragment;
  try {
    const response = await env.ASSETS.fetch(new Request(new URL('/photography', request.url)));
    const contentType = response.headers.get('content-type') || '';
    if (!response.ok || !contentType.includes('text/html')) throw new Error('Photography asset unavailable');
    const document = await response.text();
    const links = document.match(/<link\b[^>]*>/gi) ?? [];
    const selected = links.filter((tag) => {
      const rel = tag.match(/\brel\s*=\s*(["'])(.*?)\1/i)?.[2]?.toLowerCase() || '';
      const as = tag.match(/\bas\s*=\s*(["'])(.*?)\1/i)?.[2]?.toLowerCase() || '';
      return rel.split(/\s+/).includes('stylesheet') || (rel.split(/\s+/).includes('preload') && as === 'font');
    }).join('\n');
    cachedHeadFragment = selected;
    cachedHeadAt = Date.now();
    return selected;
  } catch {
    return '<style>body{margin:0;background:#101114;color:#f4f1e9;font:16px/1.6 system-ui,sans-serif}main{max-width:1100px;margin:auto;padding:2rem}img{display:block;max-width:100%;height:auto;margin:1.5rem auto}a{color:inherit}dl{display:grid;grid-template-columns:max-content 1fr;gap:.4rem 1rem}dt{font-weight:700}dd{margin:0}</style>';
  }
}

async function notFound(request, env) {
  try {
    const response = await env.ASSETS.fetch(new Request(new URL('/404.html', request.url)));
    const headers = new Headers(response.headers);
    headers.set('content-type', headers.get('content-type') || 'text/html; charset=utf-8');
    return new Response(response.body, { status: 404, statusText: 'Not Found', headers });
  } catch {
    return new Response('Not found', { status: 404, headers: { 'content-type': 'text/plain; charset=utf-8' } });
  }
}

async function photoPage(request, env, id) {
  if (!env.DB) return notFound(request, env);
  let photos;
  try {
    photos = await listPhotos(env.DB);
  } catch {
    return notFound(request, env);
  }
  const index = photos.findIndex((entry) => entry.id.toLowerCase() === id.toLowerCase());
  if (index < 0) return notFound(request, env);

  const photo = photos[index];
  const base = baseFor(request, env);
  const pageUrl = absolute(base, `/photography/${photo.id}`);
  const previewUrl = absolute(base, `/photos/p/${photo.id}`);
  const originalUrl = `/photos/o/${photo.id}`;
  const label = photoLabel(photo);
  const title = `${label} — Photography — Ashes Born`;
  const summary = description(photo);
  const dimensions = scaledDimensions(photo);
  const alt = [photoLabel(photo), photoPlace(photo), photo.takenOn].map(text).filter(Boolean).join(' · ');
  const creator = { '@type': 'Person', name: 'Ashes Born' };
  const imageObject = {
    '@context': 'https://schema.org', '@type': 'ImageObject',
    contentUrl: absolute(base, originalUrl), url: pageUrl,
    ...(Number(photo.width) > 0 ? { width: Number(photo.width) } : {}),
    ...(Number(photo.height) > 0 ? { height: Number(photo.height) } : {}),
    caption: photo.description || photoLabel(photo),
    ...(photo.takenOn ? { datePublished: photo.takenOn } : {}),
    creator, copyrightHolder: creator, creditText: 'Ashes Born', license: pageUrl,
    thumbnailUrl: previewUrl,
    isPartOf: { '@type': 'ImageGallery', name: 'Ashes Born Photography', url: absolute(base, '/photography') },
  };
  const previous = index > 0 ? photos[index - 1] : null;
  const next = index < photos.length - 1 ? photos[index + 1] : null;
  const stylesheet = await stylesheetFragment(request, env);
  // The extracted stylesheet does not size <img>, so the width/height attributes below would
  // stretch the frame once max-width kicks in. These rules are the page's own contract.
  const layoutCss = '<style>main{max-width:1100px;margin:0 auto;padding:2rem 1.25rem}article figure{margin:1.5rem 0}article img{display:block;max-width:100%;height:auto;border:2px solid #111}dl{display:grid;grid-template-columns:max-content 1fr;gap:.35rem 1rem;margin:1.5rem 0}dt{font-weight:700}dd{margin:0}nav a{margin-right:1rem}</style>';
  const document = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${html(title)}</title><meta name="description" content="${html(summary)}"><link rel="canonical" href="${html(pageUrl)}"><meta property="og:type" content="article"><meta property="og:title" content="${html(title)}"><meta property="og:description" content="${html(summary)}"><meta property="og:image" content="${html(previewUrl)}"><meta property="og:image:width" content="${dimensions.width}"><meta property="og:image:height" content="${dimensions.height}"><meta property="og:url" content="${html(pageUrl)}"><meta property="og:site_name" content="Ashes Born"><meta name="twitter:card" content="summary_large_image"><meta name="twitter:title" content="${html(title)}"><meta name="twitter:description" content="${html(summary)}"><meta name="twitter:image" content="${html(previewUrl)}"><meta name="twitter:image:alt" content="${html(alt)}">${stylesheet}${layoutCss}<script type="application/ld+json">${jsonLd(imageObject)}</script></head><body><main><nav><a href="/photography">← Photography gallery</a></nav><article><h1>${html(label)}</h1><figure><img src="${html(`/photos/p/${photo.id}`)}" alt="${html(alt)}" width="${Number(photo.width) || 0}" height="${Number(photo.height) || 0}" fetchpriority="high"><figcaption>${html(photo.description || photoLabel(photo))}</figcaption></figure>${metadataRows(photo)}<p><a href="${originalUrl}" download>Download original</a></p><nav aria-label="Photo navigation">${previous ? `<a rel="prev" href="/photography/${html(previous.id)}">← Previous: ${html(photoLabel(previous))}</a>` : ''}${previous && next ? ' · ' : ''}${next ? `<a rel="next" href="/photography/${html(next.id)}">Next: ${html(photoLabel(next))} →</a>` : ''}</nav></article></main></body></html>`;
  return new Response(document, {
    status: 200,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'public, max-age=300, s-maxage=3600', 'x-photo-page': 'worker' },
  });
}

async function galleryPage(request, env) {
  const assetResponse = await env.ASSETS.fetch(request);
  if (!(assetResponse.headers.get('content-type') || '').includes('text/html') || !env.DB) return assetResponse;
  try {
    const photos = await listPhotos(env.DB);
    if (!photos.length) return assetResponse;
    const base = baseFor(request, env);
    const canonical = absolute(base, '/photography');
    const imageUrl = absolute(base, photos[0].preview || `/photos/p/${photos[0].id}`);
    const gallery = {
      '@context': 'https://schema.org', '@type': 'ImageGallery',
      name: 'Ashes Born Photography', url: canonical, numberOfItems: photos.length,
      itemListElement: photos.slice(0, 60).map((photo) => ({
        '@type': 'ImageObject',
        contentUrl: absolute(base, photo.preview || `/photos/p/${photo.id}`),
        url: absolute(base, `/photography/${photo.id}`),
        name: photoLabel(photo),
      })),
    };
    const htmlBody = await assetResponse.clone().text();
    const additions = `${/<link\b(?=[^>]*\brel=["']canonical["'])[^>]*>/i.test(htmlBody) ? '' : `<link rel="canonical" href="${html(canonical)}">`}<meta property="og:type" content="website"><meta property="og:image" content="${html(imageUrl)}"><script type="application/ld+json">${jsonLd(gallery)}</script>`;
    const updated = htmlBody.replace(/<\/head\s*>/i, `${additions}</head>`);
    const headers = new Headers(assetResponse.headers);
    headers.delete('content-length');
    return new Response(updated, { status: assetResponse.status, statusText: assetResponse.statusText, headers });
  } catch {
    return assetResponse;
  }
}

async function photoSitemap(request, env) {
  if (!env.DB) return new Response('', { status: 503 });
  try {
    const photos = await listPhotos(env.DB);
    const base = baseFor(request, env);
    const rows = await Promise.all(photos.map(async (photo) => {
      let createdAt = '';
      try {
        const row = await env.DB.prepare('select created_at as createdAt from photos where id = ? and published = 1').bind(photo.id).first();
        createdAt = text(row?.createdAt);
      } catch { /* The capture date remains a useful lastmod. */ }
      const place = photoPlace(photo);
      const details = [place, photo.takenOn, cameraName(photo)].filter(Boolean).join(' · ');
      const geo = photo.location?.city ? `<image:geo_location>${xml(place || photo.location.city)}</image:geo_location>` : '';
      return `<url><loc>${xml(absolute(base, `/photography/${photo.id}`))}</loc>${photo.takenOn || createdAt ? `<lastmod>${xml(photo.takenOn || createdAt)}</lastmod>` : ''}<image:image><image:loc>${xml(absolute(base, photo.preview || `/photos/p/${photo.id}`))}</image:loc><image:title>${xml(photoLabel(photo))}</image:title><image:caption>${xml(details || photoLabel(photo))}</image:caption>${geo}</image:image></url>`;
    }));
    const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">${rows.join('')}</urlset>`;
    return new Response(body, { headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=1800' } });
  } catch {
    return new Response('', { status: 503 });
  }
}

export async function handlePhotoSeoRequest(request, env) {
  if (request.method !== 'GET') return null;
  const url = new URL(request.url);
  if (url.pathname === '/sitemap-photos.xml') return photoSitemap(request, env);
  const match = url.pathname.match(/^\/photography\/([^/]+)\/?$/);
  if (match && PHOTO_ID.test(match[1])) return photoPage(request, env, match[1]);
  if (url.pathname === '/photography' || url.pathname === '/photography/') return galleryPage(request, env);
  return null;
}
