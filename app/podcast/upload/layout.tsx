import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/** Admin surface: reachable, never indexed. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function PodcastUploadLayout({ children }: { children: ReactNode }) {
  return children;
}
