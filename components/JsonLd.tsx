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
  keywords,
  section,
  lang,
  imageUrl,
}: {
  url: string;
  title: string;
  images?: string[];
  datePublished: string;
  dateModified?: string | null;
  authorName: string;
  description: string;
  keywords?: string;
  section?: string;
  lang?: string;
  imageUrl?: string;
}) {
  const data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    headline: title,
    image: images.length ? images : [imageUrl ?? 'https://blog.ashesborn.cloud/avatar.jpg'],
    datePublished,
    dateModified: dateModified || datePublished,
    author: {
      '@type': 'Person',
      name: authorName,
      url: 'https://blog.ashesborn.cloud/about',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Ashes Born',
      url: 'https://ashesborn.cloud',
      logo: { '@type': 'ImageObject', url: 'https://blog.ashesborn.cloud/avatar.jpg' },
    },
    isPartOf: {
      '@type': 'Blog',
      name: 'Ashes Born — engineering notes',
      url: 'https://blog.ashesborn.cloud',
    },
    ...(keywords !== undefined ? { keywords } : {}),
    ...(section !== undefined ? { articleSection: section } : {}),
    inLanguage: lang === 'zh' ? 'zh-CN' : 'en',
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
