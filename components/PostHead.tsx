import Head from 'next/head';

interface PostHeadProps {
  title: string;
  description: string;
  date: string;
  author: string;
  url: string;
}

export default function PostHead({ title, description, date, author, url }: PostHeadProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const ogImageUrl = `${siteUrl}/api/og?title=${encodeURIComponent(title)}&date=${encodeURIComponent(date)}&author=${encodeURIComponent(author)}`;
  
  return (
    <Head>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="icon" href="/favicon.ico" sizes="any" />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="article" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImageUrl} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={ogImageUrl} />
      
      {/* Canonical link */}
      <link rel="canonical" href={url} />
    </Head>
  );
}
