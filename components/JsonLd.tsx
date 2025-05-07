import type React from 'react';

interface JsonLdProps {
  data: Record<string, unknown>;
}

const JsonLd: React.FC<JsonLdProps> = ({ data }) => {
  return (
    <script
      type="application/ld+json"
      // biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation>
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export function BlogPostJsonLd({
  url,
  title,
  images = [],
  datePublished,
  dateModified = null,
  authorName,
  description,
}: {
  url: string;
  title: string;
  images?: string[];
  datePublished: string;
  dateModified?: string | null;
  authorName: string;
  description: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    headline: title,
    image: images,
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    description,
  };

  return <JsonLd data={data} />;
}

export function WebsiteJsonLd({
  url,
  name,
  description,
}: {
  url: string;
  name: string;
  description: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url,
    name,
    description,
  };

  return <JsonLd data={data} />;
}

export default JsonLd;
