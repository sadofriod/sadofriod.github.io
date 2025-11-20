import { Podcast, PodcastMetadata } from './podcasts';
import { prisma } from './prisma';
import { getPresignedUrlFromS3Url } from './s3';

// Database storage using Prisma
export async function getAllPodcasts(): Promise<Podcast[]> {
  const podcasts = await prisma.podcast.findMany({
    orderBy: {
      date: 'desc',
    },
  });

  return Promise.all(podcasts.map(async (p) => {
    // Generate presigned URLs with 7 day expiration
    const audioPresignedUrl = await getPresignedUrlFromS3Url(p.audioUrl);
    const imagePresignedUrl = p.image ? await getPresignedUrlFromS3Url(p.image) : undefined;

    return {
      id: p.id,
      metadata: {
        title: p.title,
        date: p.date.toISOString().split('T')[0],
        description: p.description,
        duration: p.duration,
        audioUrl: audioPresignedUrl,
        author: p.author || undefined,
        episodeNumber: p.episodeNumber || undefined,
        season: p.season || undefined,
        image: imagePresignedUrl,
        keywords: p.keywords,
        explicit: p.explicit,
      },
    };
  }));
}

export async function getPodcastById(id: string): Promise<Podcast | null> {
  const podcast = await prisma.podcast.findUnique({
    where: { id },
  });

  if (!podcast) return null;

  // Generate presigned URLs with 7 day expiration
  const audioPresignedUrl = await getPresignedUrlFromS3Url(podcast.audioUrl);
  const imagePresignedUrl = podcast.image ? await getPresignedUrlFromS3Url(podcast.image) : undefined;

  return {
    id: podcast.id,
    metadata: {
      title: podcast.title,
      date: podcast.date.toISOString().split('T')[0],
      description: podcast.description,
      duration: podcast.duration,
      audioUrl: audioPresignedUrl,
      author: podcast.author || undefined,
      episodeNumber: podcast.episodeNumber || undefined,
      season: podcast.season || undefined,
      image: imagePresignedUrl,
      keywords: podcast.keywords,
      explicit: podcast.explicit,
    },
  };
}

export async function addPodcast(data: { 
  title: string; 
  description: string; 
  duration: string; 
  s3AudioUrl: string; 
  s3ImageUrl?: string;
  author?: string;
  episodeNumber?: number;
  season?: number;
  date: string;
  explicit?: boolean;
  keywords?: string[];
}): Promise<Podcast> {
  const podcast = await prisma.podcast.create({
    data: {
      title: data.title,
      date: new Date(data.date),
      description: data.description,
      duration: data.duration,
      audioUrl: data.s3AudioUrl, // Store S3 URL in database
      author: data.author,
      episodeNumber: data.episodeNumber,
      season: data.season,
      image: data.s3ImageUrl, // Store S3 URL in database
      keywords: data.keywords || [],
      explicit: data.explicit || false,
    },
  });

  // Generate presigned URLs for response
  const audioPresignedUrl = await getPresignedUrlFromS3Url(podcast.audioUrl);
  const imagePresignedUrl = podcast.image ? await getPresignedUrlFromS3Url(podcast.image) : undefined;

  return {
    id: podcast.id,
    metadata: {
      title: podcast.title,
      date: podcast.date.toISOString().split('T')[0],
      description: podcast.description,
      duration: podcast.duration,
      audioUrl: audioPresignedUrl,
      author: podcast.author || undefined,
      episodeNumber: podcast.episodeNumber || undefined,
      season: podcast.season || undefined,
      image: imagePresignedUrl,
      keywords: podcast.keywords,
      explicit: podcast.explicit,
    },
  };
}

export async function updatePodcast(id: string, metadata: Partial<PodcastMetadata> & { s3ImageUrl?: string; s3AudioUrl?: string }): Promise<Podcast | null> {
  try {
    const podcast = await prisma.podcast.update({
      where: { id },
      data: {
        ...(metadata.title && { title: metadata.title }),
        ...(metadata.date && { date: new Date(metadata.date) }),
        ...(metadata.description && { description: metadata.description }),
        ...(metadata.duration && { duration: metadata.duration }),
        ...(metadata.author !== undefined && { author: metadata.author }),
        ...(metadata.episodeNumber !== undefined && { episodeNumber: metadata.episodeNumber }),
        ...(metadata.season !== undefined && { season: metadata.season }),
        ...(metadata.s3ImageUrl !== undefined && { image: metadata.s3ImageUrl }), // Store S3 URL
        ...(metadata.s3AudioUrl !== undefined && { audioUrl: metadata.s3AudioUrl }), // Store S3 URL
        ...(metadata.keywords && { keywords: metadata.keywords }),
        ...(metadata.explicit !== undefined && { explicit: metadata.explicit }),
      },
    });

    // Generate presigned URLs for response
    const audioPresignedUrl = await getPresignedUrlFromS3Url(podcast.audioUrl);
    const imagePresignedUrl = podcast.image ? await getPresignedUrlFromS3Url(podcast.image) : undefined;

    return {
      id: podcast.id,
      metadata: {
        title: podcast.title,
        date: podcast.date.toISOString().split('T')[0],
        description: podcast.description,
        duration: podcast.duration,
        audioUrl: audioPresignedUrl,
        author: podcast.author || undefined,
        episodeNumber: podcast.episodeNumber || undefined,
        season: podcast.season || undefined,
        image: imagePresignedUrl,
        keywords: podcast.keywords,
        explicit: podcast.explicit,
      },
    };
  } catch (error) {
    return null;
  }
}

export async function deletePodcast(id: string): Promise<boolean> {
  try {
    await prisma.podcast.delete({
      where: { id },
    });
    return true;
  } catch (error) {
    return false;
  }
}
