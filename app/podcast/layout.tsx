import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Podcast',
  description: 'Episodes from Ashes Born on GraphRAG, TypeScript and building software alone.',
  alternates: { canonical: '/podcast' },
};

export default function PodcastLayout({ children }: { children: ReactNode }) {
  return children;
}
