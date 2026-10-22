import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Photography — Ashes Born',
  description: 'Frames from places and light worth going back to.',
};

export default function PhotographyLayout({ children }: { children: React.ReactNode }) {
  return children;
}
