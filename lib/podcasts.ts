// Types for Podcast
export type PodcastMetadata = {
  title: string;
  date: string;
  description: string;
  duration: string; // e.g., "45:30"
  audioUrl: string; // URL to the audio file
  author?: string;
  episodeNumber?: number;
  season?: number;
  image?: string;
  keywords?: string[];
  explicit?: boolean;
};

export type Podcast = {
  id: string;
  metadata: PodcastMetadata;
};

import { getAllPodcasts, getPodcastById as getById } from './podcastStorage';

// API functions
export async function getPodcasts(): Promise<Podcast[]> {
  return getAllPodcasts();
}

export async function getPodcastById(id: string): Promise<Podcast | null> {
  return getById(id);
}

// Helper to convert duration string to seconds
export function durationToSeconds(duration: string): number {
  const parts = duration.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}
