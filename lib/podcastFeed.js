import { db } from './db.js';
import { listPodcasts } from './podcastStore.js';

function escapeXml(value) {
  const characters = { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' };
  return String(value ?? '').replace(/[<>&"']/g, (character) => characters[character]);
}

export async function podcastRss(request, env) {
  const records = await listPodcasts(db(env));
  const origin = new URL(request.url).origin;

  const items = records
    .filter(({ metadata }) => Boolean(metadata.audioUrl))
    .map(({ id, metadata }) => {
      const audioUrl = new URL(metadata.audioUrl, origin).href;
      const image = metadata.image
        ? `<itunes:image href="${escapeXml(new URL(metadata.image, origin).href)}"/>`
        : '';
      const episode = metadata.episodeNumber ? `<itunes:episode>${metadata.episodeNumber}</itunes:episode>` : '';
      const season = metadata.season ? `<itunes:season>${metadata.season}</itunes:season>` : '';

      return `<item><title>${escapeXml(metadata.title)}</title><description>${escapeXml(metadata.description)}</description><enclosure url="${escapeXml(audioUrl)}" type="${escapeXml(metadata.audioType)}" length="${metadata.audioSize ?? 0}"/><guid isPermaLink="false">${escapeXml(id)}</guid><pubDate>${new Date(metadata.date).toUTCString()}</pubDate><itunes:duration>${escapeXml(metadata.duration)}</itunes:duration><itunes:explicit>${metadata.explicit ? 'true' : 'false'}</itunes:explicit>${episode}${season}${image}</item>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?><rss version="2.0" xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"><channel><title>Ashes Space Podcast</title><link>${origin}/podcast</link><description>Technology, development, and innovation</description><language>en</language>${items}</channel></rss>`;

  return new Response(xml, { headers: { 'content-type': 'application/rss+xml; charset=utf-8' } });
}
