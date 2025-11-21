import { Podcast, PodcastMetadata } from './podcasts';
import { prisma } from './prisma';

// Database storage using Prisma
export async function getAllPodcasts(): Promise<Podcast[]> {
  const podcasts = await prisma.podcast.findMany({
    orderBy: {
      date: 'desc',
    },
  });

  return podcasts.map((p) => ({
    id: p.id,
    metadata: {
      title: p.title,
      date: p.date.toISOString().split('T')[0],
      description: p.description,
      duration: p.duration,
      audioUrl: p.audioUrl, // Direct public S3 URL
      author: p.author || undefined,
      episodeNumber: p.episodeNumber || undefined,
      season: p.season || undefined,
      image: p.image || undefined, // Direct public S3 URL
      keywords: p.keywords,
      explicit: p.explicit,
    },
  }));
}

export async function getPodcastById(id: string): Promise<Podcast | null> {
  const podcast = await prisma.podcast.findUnique({
    where: { id },
  });

  if (!podcast) return null;

  return {
    id: podcast.id,
    metadata: {
      title: podcast.title,
      date: podcast.date.toISOString().split('T')[0],
      description: podcast.description,
      duration: podcast.duration,
      audioUrl: podcast.audioUrl, // Direct public S3 URL
      author: podcast.author || undefined,
      episodeNumber: podcast.episodeNumber || undefined,
      season: podcast.season || undefined,
      image: podcast.image || undefined, // Direct public S3 URL
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
      audioUrl: data.s3AudioUrl, // Store public S3 URL
      author: data.author,
      episodeNumber: data.episodeNumber,
      season: data.season,
      image: data.s3ImageUrl, // Store public S3 URL
      keywords: data.keywords || [],
      explicit: data.explicit || false,
    },
  });

  return {
    id: podcast.id,
    metadata: {
      title: podcast.title,
      date: podcast.date.toISOString().split('T')[0],
      description: podcast.description,
      duration: podcast.duration,
      audioUrl: podcast.audioUrl, // Direct public S3 URL
      author: podcast.author || undefined,
      episodeNumber: podcast.episodeNumber || undefined,
      season: podcast.season || undefined,
      image: podcast.image || undefined, // Direct public S3 URL
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
        ...(metadata.s3ImageUrl !== undefined && { image: metadata.s3ImageUrl }), // Store public S3 URL
        ...(metadata.s3AudioUrl !== undefined && { audioUrl: metadata.s3AudioUrl }), // Store public S3 URL
        ...(metadata.keywords && { keywords: metadata.keywords }),
        ...(metadata.explicit !== undefined && { explicit: metadata.explicit }),
      },
    });

    return {
      id: podcast.id,
      metadata: {
        title: podcast.title,
        date: podcast.date.toISOString().split('T')[0],
        description: podcast.description,
        duration: podcast.duration,
        audioUrl: podcast.audioUrl, // Direct public S3 URL
        author: podcast.author || undefined,
        episodeNumber: podcast.episodeNumber || undefined,
        season: podcast.season || undefined,
        image: podcast.image || undefined, // Direct public S3 URL
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
