import type { Metadata } from 'next';
import type { ReactNode } from 'react';

/** Tool page: no search value, keep it out of the index. */
export const metadata: Metadata = { robots: { index: false, follow: false } };

export default function VerifyLayout({ children }: { children: ReactNode }) {
  return children;
}
