const AUDIO_TYPES = new Set(['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/x-m4a', 'audio/mp4']);
const IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const AUDIO_LIMIT = 100 * 1024 * 1024;
const IMAGE_LIMIT = 10 * 1024 * 1024;

export const json = (body, status = 200) => Response.json(body, { status });
export const isFile = (value) => typeof File !== 'undefined' && value instanceof File;
export const publicRecord = ({ audioKey, imageKey, ...record }) => record;

export function mediaUrl(key) {
  return `/podcast-media/${encodeURIComponent(key)}`;
}

function mediaType(file, kind) {
  if (file.type) return file.type;
  const extension = file.name.toLowerCase().split('.').pop();
  const audio = { mp3: 'audio/mpeg', wav: 'audio/wav', ogg: 'audio/ogg', m4a: 'audio/mp4' };
  const image = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp' };
  return kind === 'audio' ? audio[extension] || '' : image[extension] || '';
}

export function validateFile(file, kind) {
  if (!isFile(file) || file.size === 0) return { error: `${kind} file is required` };
  const limit = kind === 'audio' ? AUDIO_LIMIT : IMAGE_LIMIT;
  const allowedTypes = kind === 'audio' ? AUDIO_TYPES : IMAGE_TYPES;
  const type = mediaType(file, kind);
  if (file.size > limit) return { error: `${kind} file exceeds the size limit` };
  if (!allowedTypes.has(type)) return { error: `Unsupported ${kind} file type` };
  return { type };
}

export function fieldValue(form, body, name) {
  return form ? form.get(name) : body[name];
}

export async function parsePayload(request) {
  if ((request.headers.get('content-type') || '').includes('multipart/form-data')) {
    return { form: await request.formData(), body: null };
  }
  return { form: null, body: await request.json() };
}

export async function authenticate(form, body, env) {
  const key = fieldValue(form, body, 'authKey');
  return typeof key === 'string' && env.UPLOAD_AUTH_KEY && key === env.UPLOAD_AUTH_KEY
    ? null
    : json({ error: 'Unauthorized' }, 401);
}

export async function uploadMedia(bucket, id, file, kind, type) {
  if (!isFile(file) || file.size === 0) return null;
  const prefix = kind === 'audio' ? 'podcasts/audio' : 'podcasts/covers';
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-120) || 'upload';
  const key = `${prefix}/${id}/${crypto.randomUUID()}-${safeName}`;
  await bucket.put(key, file.stream(), {
    httpMetadata: {
      contentType: type,
      cacheControl: 'public, max-age=31536000, immutable',
    },
  });
  return key;
}

export function createMetadata(fields, current, audioKey, imageKey, audioFile) {
  const { form, body } = fields;
  const metadata = current?.metadata || {};
  const value = (name) => fieldValue(form, body, name);
  const keywords = value('keywords');
  const explicit = value('explicit');
  const episodeNumber = value('episodeNumber');
  const season = value('season');
  return {
    title: value('title') ?? metadata.title ?? '',
    date: metadata.date || new Date().toISOString().slice(0, 10),
    description: value('description') ?? metadata.description ?? '',
    duration: value('duration') ?? metadata.duration ?? '',
    audioUrl: audioKey ? mediaUrl(audioKey) : metadata.audioUrl || '',
    author: value('author') ?? metadata.author ?? 'Ashes Space',
    episodeNumber: episodeNumber ? Number(episodeNumber) : metadata.episodeNumber,
    season: season ? Number(season) : metadata.season,
    image: imageKey ? mediaUrl(imageKey) : metadata.image,
    keywords: keywords == null ? metadata.keywords || [] : String(keywords).split(',').map((word) => word.trim()).filter(Boolean),
    explicit: explicit == null ? metadata.explicit || false : explicit === true || explicit === 'true',
    audioSize: audioFile?.size ?? metadata.audioSize ?? 0,
    audioType: audioFile ? mediaType(audioFile, 'audio') : metadata.audioType || 'audio/mpeg',
  };
}