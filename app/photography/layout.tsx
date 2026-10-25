import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const metadata: Metadata = {
  title: 'Photography',
  description: 'Frames from places and light worth going back to.',
  alternates: { canonical: '/photography' },
};

export default function PhotographyLayout({ children }: { children: ReactNode }) {
  return children;
}
