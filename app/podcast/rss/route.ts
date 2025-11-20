import { getPodcasts, durationToSeconds } from '@/lib/podcasts';

const site_url = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.ashesborn.cloud';

declare const process: {
  env: {
    NEXT_PUBLIC_SITE_URL?: string;
  };
};

export async function GET() {
  try {
    const podcasts = await getPodcasts();
    
    // Sort by date, newest first
    const sortedPodcasts = [...podcasts].sort((a, b) => {
      return new Date(b.metadata.date).getTime() - new Date(a.metadata.date).getTime();
    });

    const podcastInfo = {
      title: 'Ashes Space Podcast',
      description: 'A podcast series covering technology, development, and innovation',
      author: 'Ashes Space',
      email: 'justlikeashes@gmail.com',
      category: 'Technology',
      subcategory: 'Software Development',
      language: 'en',
      copyright: `© ${new Date().getFullYear()} Ashes Space`,
      imageUrl: `${site_url}/podcast-cover.jpg`,
    };

    const itemsXml = sortedPodcasts
      .map((podcast) => {
        const { metadata } = podcast;
        const pubDate = new Date(metadata.date).toUTCString();
        const duration = durationToSeconds(metadata.duration);
        
        return `
    <item>
      <title>${escapeXml(metadata.title)}</title>
      <description>${escapeXml(metadata.description)}</description>
      <link>${site_url}/podcast/${podcast.id}</link>
      <guid isPermaLink="true">${site_url}/podcast/${podcast.id}</guid>
      <pubDate>${pubDate}</pubDate>
      <enclosure url="${escapeXml(metadata.audioUrl)}" type="audio/mpeg" length="0"/>
      <itunes:author>${escapeXml(metadata.author || podcastInfo.author)}</itunes:author>
      <itunes:subtitle>${escapeXml(metadata.description.substring(0, 100))}</itunes:subtitle>
      <itunes:summary>${escapeXml(metadata.description)}</itunes:summary>
      <itunes:duration>${duration}</itunes:duration>
      ${metadata.image ? `<itunes:image href="${escapeXml(metadata.image)}"/>` : ''}
      ${metadata.episodeNumber ? `<itunes:episode>${metadata.episodeNumber}</itunes:episode>` : ''}
      ${metadata.season ? `<itunes:season>${metadata.season}</itunes:season>` : ''}
      <itunes:explicit>${metadata.explicit ? 'yes' : 'no'}</itunes:explicit>
      ${metadata.keywords && metadata.keywords.length > 0 ? `<itunes:keywords>${escapeXml(metadata.keywords.join(', '))}</itunes:keywords>` : ''}
    </item>`;
      })
      .join('\n');

    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" 
     xmlns:itunes="http://www.itunes.com/dtds/podcast-1.0.dtd"
     xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(podcastInfo.title)}</title>
    <link>${site_url}/podcast</link>
    <language>${podcastInfo.language}</language>
    <copyright>${escapeXml(podcastInfo.copyright)}</copyright>
    <description>${escapeXml(podcastInfo.description)}</description>
    <itunes:author>${escapeXml(podcastInfo.author)}</itunes:author>
    <itunes:summary>${escapeXml(podcastInfo.description)}</itunes:summary>
    <itunes:owner>
      <itunes:name>${escapeXml(podcastInfo.author)}</itunes:name>
      <itunes:email>${podcastInfo.email}</itunes:email>
    </itunes:owner>
    <itunes:image href="${podcastInfo.imageUrl}"/>
    <itunes:category text="${podcastInfo.category}">
      <itunes:category text="${podcastInfo.subcategory}"/>
    </itunes:category>
    <itunes:explicit>no</itunes:explicit>
    ${itemsXml}
  </channel>
</rss>`;

    return new Response(rssFeed, {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    });
  } catch (error) {
    console.error('Error generating podcast RSS feed:', error);
    return new Response('Error generating RSS feed', { status: 500 });
  }
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
