import { closeDb, createDb, databaseMissing, isDatabaseConfigured } from './db.js';
import { getPodcast, listPodcasts } from './podcastStore.js';
import { deletePodcast, createPodcast, updatePodcast } from './podcastMutations.js';
import { podcastRss } from './podcastFeed.js';
import { podcastMedia } from './podcastMedia.js';
import { json } from './podcastValidation.js';

export async function handlePodcastRequest(request, env, ctx) {
  const { pathname } = new URL(request.url);

  try {
    if (pathname === '/api/auth/upload' && request.method === 'POST') {
      const body = await request.json();
      if (!env.UPLOAD_AUTH_KEY) return json({ error: 'Upload auth is not configured' }, 503);
      return body.key === env.UPLOAD_AUTH_KEY ? json({ success: true }) : json({ error: 'Invalid authentication key' }, 401);
    }

    const podcastPath = pathname.startsWith('/api/podcasts') || pathname.startsWith('/podcast-media/') || pathname === '/podcast/rss';
    if (!podcastPath) return null;
    if (!env.PODCASTS) return json({ error: 'R2 bucket is not configured' }, 503);

    // Media bytes are streamed straight out of R2 and need no database.
    if (pathname.startsWith('/podcast-media/') && ['GET', 'HEAD'].includes(request.method)) {
      return podcastMedia(request, env.PODCASTS, pathname.slice('/podcast-media/'.length));
    }

    if (!isDatabaseConfigured(env)) return databaseMissing();

    const sql = createDb(env);

    try {
      return await route(request, env, pathname, sql);
    } finally {
      await closeDb(sql);
    }
  } catch (error) {
    console.error('Podcast Worker request failed:', error);
    return json({ error: 'Podcast request failed' }, 500);
  }
}

async function route(request, env, pathname, sql) {
  if (pathname === '/api/podcasts' && request.method === 'GET') {
    return json(await listPodcasts(sql));
  }
  if (pathname === '/api/podcasts' && request.method === 'POST') return createPodcast(request, env, sql);
  if (pathname === '/podcast/rss' && request.method === 'GET') return podcastRss(request, env, sql);

  if (pathname.startsWith('/api/podcasts/')) {
    const id = decodeURIComponent(pathname.slice('/api/podcasts/'.length));
    if (request.method === 'GET') {
      const record = await getPodcast(sql, id);
      return record ? json(record) : json({ error: 'Podcast not found' }, 404);
    }
    if (request.method === 'PATCH') return updatePodcast(request, env, id, sql);
    if (request.method === 'DELETE') return deletePodcast(request, env, id, sql);
  }

  return null;
}
