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
    inLanguage: lang === 'zh' ? 'zh-Hans' : 'en',
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

export function SiteJsonLd({ siteUrl }: { siteUrl: string }) {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        '@id': 'https://ashesborn.cloud/#org',
        name: 'Ashes Born',
        alternateName: 'Ashes Born Trade and Services Limited',
        url: 'https://ashesborn.cloud',
        logo: { '@type': 'ImageObject', url: `${siteUrl}/avatar.jpg` },
        sameAs: ['https://github.com/sadofriod', 'https://ashesborn.cloud', 'https://blog.ashesborn.cloud'],
      },
      {
        '@type': 'WebSite',
        '@id': `${siteUrl}/#website`,
        url: siteUrl,
        name: 'Ashes Born — engineering notes',
        description:
          'Technical notes on GraphRAG, TypeScript and frontend architecture, alongside a photography gallery and podcast.',
        inLanguage: 'en',
        publisher: { '@id': 'https://ashesborn.cloud/#org' },
      },
    ],
  };

  return <JsonLd data={data} />;
}

export function BlogPostingsJsonLd({
  siteUrl,
  posts,
}: {
  siteUrl: string;
  posts: { slug: string; title: string; date: string; description: string; lang?: string }[];
}) {
  if (posts.length === 0) return null;

  const data = {
    '@context': 'https://schema.org',
    '@graph': posts.map((post) => {
      const url = `${siteUrl}/blog/${encodeURI(post.slug)}`;

      return {
        '@type': 'BlogPosting',
        '@id': `${url}#article`,
        mainEntityOfPage: { '@type': 'WebPage', '@id': url },
        headline: post.title,
        url,
        datePublished: post.date,
        dateModified: post.date,
        description: post.description,
        inLanguage: post.lang === 'zh' ? 'zh-Hans' : 'en',
        author: { '@type': 'Person', name: 'Ashes Born', url: `${siteUrl}/about` },
        publisher: { '@id': 'https://ashesborn.cloud/#org' },
        isPartOf: { '@type': 'Blog', '@id': `${siteUrl}/#website` },
      };
    }),
  };

  return <JsonLd data={data} />;
}

export default JsonLd;
