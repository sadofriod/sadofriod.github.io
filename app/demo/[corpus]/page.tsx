import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import DemoViewer from '@/components/DemoViewer';
import { DEMO_IDS, getDemo, pickText } from '@/lib/demos';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blog.ashesborn.cloud';

export const dynamicParams = false;

export function generateStaticParams() {
  return DEMO_IDS.map((corpus) => ({ corpus }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ corpus: string }>;
}): Promise<Metadata> {
  const { corpus } = await params;
  const demo = getDemo(corpus);
  if (!demo) notFound();
  return {
    title: pickText(demo.title, 'en'),
    description: pickText(demo.subtitle, 'en'),
    alternates: { canonical: `${SITE}/demo/${corpus}` },
  };
}

export default async function DemoCorpusPage({
  params,
}: {
  params: Promise<{ corpus: string }>;
}) {
  const { corpus } = await params;
  const demo = getDemo(corpus);
  if (!demo) notFound();
  return <DemoViewer corpus={demo} />;
}
