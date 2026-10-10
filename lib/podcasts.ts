export type PodcastMetadata = {
  title: string;
  date: string;
  description: string;
  duration: string;
  audioUrl: string;
  audioSize?: number;
  audioType?: string;
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

export function durationToSeconds(duration: string): number {
  const parts = duration.split(':').map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return 0;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return 0;
}