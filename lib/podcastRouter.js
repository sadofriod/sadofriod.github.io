import { getPodcastRecord, listPodcastRecords } from './podcastR2.js';
import { deletePodcast, createPodcast, updatePodcast } from './podcastMutations.js';
import { podcastRss } from './podcastFeed.js';
import { podcastMedia } from './podcastMedia.js';
import { json, publicRecord } from './podcastValidation.js';

export async function handlePodcastRequest(request, env) {
  const { pathname } = new URL(request.url);

  try {
    if (pathname === '/api/auth/upload' && request.method === 'POST') {
      const body = await request.json();
      if (!env.UPLOAD_AUTH_KEY) return json({ error: 'Upload auth is not configured' }, 503);
      return body.key === env.UPLOAD_AUTH_KEY ? json({ success: true }) : json({ error: 'Invalid authentication key' }, 401);
    }

    const podcastPath = pathname.startsWith('/api/podcasts') || pathname.startsWith('/podcast-media/') || pathname === '/podcast/rss';
    if (!env.PODCASTS) return podcastPath ? json({ error: 'R2 bucket is not configured' }, 503) : null;

    if (pathname === '/api/podcasts' && request.method === 'GET') {
      return json((await listPodcastRecords(env.PODCASTS)).map(publicRecord));
    }
    if (pathname === '/api/podcasts' && request.method === 'POST') return createPodcast(request, env);
    if (pathname === '/podcast/rss' && request.method === 'GET') return podcastRss(request, env);
    if (pathname.startsWith('/podcast-media/') && ['GET', 'HEAD'].includes(request.method)) {
      return podcastMedia(request, env.PODCASTS, pathname.slice('/podcast-media/'.length));
    }

    if (pathname.startsWith('/api/podcasts/')) {
      const id = decodeURIComponent(pathname.slice('/api/podcasts/'.length));
      if (request.method === 'GET') {
        const stored = await getPodcastRecord(env.PODCASTS, id);
        return stored ? json(publicRecord(stored.record)) : json({ error: 'Podcast not found' }, 404);
      }
      if (request.method === 'PATCH') return updatePodcast(request, env, id);
      if (request.method === 'DELETE') return deletePodcast(request, env, id);
    }
  } catch (error) {
    console.error('Podcast Worker request failed:', error);
    return json({ error: 'Podcast request failed' }, 500);
  }

  return null;
}