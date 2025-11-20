import { Podcast, PodcastMetadata } from './podcasts';
import { prisma } from './prisma';

// Database storage using Prisma
export async function getAllPodcasts(): Promise<Podcast[]> {
  const podcasts = await prisma.podcast.findMany({
    orderBy: {
      date: 'desc',
    },
  });

  return podcasts.map(p => ({
    id: p.id,
    metadata: {
      title: p.title,
      date: p.date.toISOString().split('T')[0],
      description: p.description,
      duration: p.duration,
      audioUrl: p.audioUrl,
      author: p.author || undefined,
      episodeNumber: p.episodeNumber || undefined,
      season: p.season || undefined,
      image: p.image || undefined,
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
      audioUrl: podcast.audioUrl,
      author: podcast.author || undefined,
      episodeNumber: podcast.episodeNumber || undefined,
      season: podcast.season || undefined,
      image: podcast.image || undefined,
      keywords: podcast.keywords,
      explicit: podcast.explicit,
    },
  };
}

export async function addPodcast(metadata: PodcastMetadata): Promise<Podcast> {
  const podcast = await prisma.podcast.create({
    data: {
      title: metadata.title,
      date: new Date(metadata.date),
      description: metadata.description,
      duration: metadata.duration,
      audioUrl: metadata.audioUrl,
      author: metadata.author,
      episodeNumber: metadata.episodeNumber,
      season: metadata.season,
      image: metadata.image,
      keywords: metadata.keywords || [],
      explicit: metadata.explicit || false,
    },
  });

  return {
    id: podcast.id,
    metadata: {
      title: podcast.title,
      date: podcast.date.toISOString().split('T')[0],
      description: podcast.description,
      duration: podcast.duration,
      audioUrl: podcast.audioUrl,
      author: podcast.author || undefined,
      episodeNumber: podcast.episodeNumber || undefined,
      season: podcast.season || undefined,
      image: podcast.image || undefined,
      keywords: podcast.keywords,
      explicit: podcast.explicit,
    },
  };
}

export async function updatePodcast(id: string, metadata: Partial<PodcastMetadata>): Promise<Podcast | null> {
  try {
    const podcast = await prisma.podcast.update({
      where: { id },
      data: {
        ...(metadata.title && { title: metadata.title }),
        ...(metadata.date && { date: new Date(metadata.date) }),
        ...(metadata.description && { description: metadata.description }),
        ...(metadata.duration && { duration: metadata.duration }),
        ...(metadata.audioUrl && { audioUrl: metadata.audioUrl }),
        ...(metadata.author !== undefined && { author: metadata.author }),
        ...(metadata.episodeNumber !== undefined && { episodeNumber: metadata.episodeNumber }),
        ...(metadata.season !== undefined && { season: metadata.season }),
        ...(metadata.image !== undefined && { image: metadata.image }),
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
        audioUrl: podcast.audioUrl,
        author: podcast.author || undefined,
        episodeNumber: podcast.episodeNumber || undefined,
        season: podcast.season || undefined,
        image: podcast.image || undefined,
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
