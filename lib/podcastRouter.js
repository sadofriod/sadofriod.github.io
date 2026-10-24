import { databaseMissing, getDb, isDatabaseConfigured } from './db.js';
import { getPodcast, listPodcasts } from './podcastStore.js';
import { deletePodcast, createPodcast, updatePodcast } from './podcastMutations.js';
import { podcastRss } from './podcastFeed.js';
import { podcastMedia } from './podcastMedia.js';
import { json } from './podcastValidation.js';

export async function handlePodcastRequest(request, env) {
  const { pathname: rawPath } = new URL(request.url);
  // Same alias rule as the photos router: Access protects /api/admin/* because the
  // public feed has to stay reachable at /api/podcasts.
  const pathname = rawPath.startsWith('/api/admin/podcasts')
    ? rawPath.replace('/api/admin/podcasts', '/api/podcasts')
    : rawPath;

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
      const key = pathname.slice('/podcast-media/'.length);
      const dbForMedia = isDatabaseConfigured(env) ? getDb(env) : null;
      return podcastMedia(
        request,
        env.PODCASTS,
        key,
        dbForMedia
          ? (candidate) =>
              dbForMedia
                .prepare(
                  'select 1 as ok from podcast_episodes where audio_key = ?1 or cover_key = ?1 or video_key = ?1 limit 1'
                )
                .bind(decodeURIComponent(candidate))
                .first()
                .then(Boolean)
          : null
      );
    }

    if (!isDatabaseConfigured(env)) return databaseMissing();

    const db = getDb(env);

    if (pathname === '/api/podcasts' && request.method === 'GET') {
      return json(await listPodcasts(db));
    }
    if (pathname === '/api/podcasts' && request.method === 'POST') return createPodcast(request, env, db);
    if (pathname === '/podcast/rss' && request.method === 'GET') return podcastRss(request, env, db);

    if (pathname.startsWith('/api/podcasts/')) {
      const id = decodeURIComponent(pathname.slice('/api/podcasts/'.length));
      if (!id) return json({ error: 'Podcast not found' }, 404);

      if (request.method === 'GET') {
        const record = await getPodcast(db, id);
        return record ? json(record) : json({ error: 'Podcast not found' }, 404);
      }
      if (request.method === 'PATCH') return updatePodcast(request, env, id, db);
      if (request.method === 'DELETE') return deletePodcast(request, env, id, db);
    }
  } catch (error) {
    console.error('Podcast Worker request failed:', error);
    return json({ error: 'Podcast request failed' }, 500);
  }

  return null;
}
