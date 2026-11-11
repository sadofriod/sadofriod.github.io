import type { ElementType, ReactNode } from 'react';
import { getAllPostIds, getPostBySlug, getPostData } from '../../../lib/posts';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import rehypeKatex from 'rehype-katex';
import Link from 'next/link';
import ShareButton from '../../../components/ShareButton';
import CodeBlock from '../../../components/CodeBlock';
import InlineCode from '../../../components/InlineCode';
import MermaidBlock from '../../../components/MermaidBlock';
import MathBlock from '../../../components/MathBlock';
import TOC from '../../../components/TOC';
import ProfileCallout from '../../../components/profile/ProfileCallout';
import { BlogPostJsonLd } from '../../../components/JsonLd';
import { profile } from '../../../data/profile';
import { slugToFilename } from '../../../lib/utils';
import T from '../../../components/T';
import LocalizedDate from '@/components/LocalizedDate';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const decodedSlug = decodeURIComponent(slug);
  const { metadata } = getPostBySlug(decodedSlug);

  const site = process.env.NEXT_PUBLIC_SITE_URL || 'https://blog.ashesborn.cloud';
  const alternates = metadata.alternates ?? {};
  const languages =
    Object.keys(alternates).length > 1
      ? Object.fromEntries(
          Object.entries(alternates).map(([lang, siblingSlug]) => [
            lang === 'zh' ? 'zh-CN' : lang,
            `${site}/blog/${encodeURI(siblingSlug)}`,
          ])
        )
      : undefined;

  return {
    title: metadata.title,
    description: metadata.description || metadata.excerpt || metadata.title,
    keywords: metadata.keywords,
    alternates: {
      canonical: `${site}/blog/${slug}`,
      ...(languages ? { languages } : {}),
    },
    openGraph: {
      title: metadata.title,
      description: metadata.description || metadata.excerpt || metadata.title,
      url: `${site}/blog/${slug}`,
      type: 'article',
      publishedTime: metadata.date,
      siteName: 'Ashes Born',
      images: ['https://blog.ashesborn.cloud/avatar.jpg'],
    },
    twitter: {
      card: 'summary_large_image',
      title: metadata.title,
      description: metadata.description || metadata.excerpt || metadata.title,
    },
    robots: metadata.isHidden
      ? { index: false, follow: true }
      : { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  };
}

export async function generateStaticParams() {
  const posts = getAllPostIds();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export const dynamicParams = false;

// Generate heading ID from text (must stay in sync with components/TOC.tsx)
const generateHeadingId = (text: string) => {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
};

/**
 * Markdown headings, rendered as plain HTML so the neo-brutalist
 * `.article-body` rules apply. The generated `id` keeps TOC anchors working.
 */
function ArticleHeading({
  as: Tag,
  node: _node,
  children,
  ...props
}: {
  as: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  node?: unknown;
  children?: ReactNode;
  [key: string]: unknown;
}) {
  const id = generateHeadingId(String(children));
  const Element = Tag as ElementType;

  return (
    <Element id={id} style={{ scrollMarginTop: '96px' }} {...props}>
      {children}
    </Element>
  );
}

export default async function BlogPost({ params }: PageProps) {
  const { slug: routeSlug } = await params;
  const decodedSlug = decodeURIComponent(routeSlug);
  const { content, slug, ...metadata } = getPostData(decodedSlug);
  const postUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://blog.ashesborn.cloud'}/blog/${routeSlug}`;
  // profile.fullStory.file is a file name with extension; route slugs are not.
  const isFullStory =
    slugToFilename(decodedSlug) === profile.fullStory.file.replace(/\.(md|mdx)$/, '');
  const relatedPosts = getAllPostIds()
    .filter(
      (post) =>
        !post.isHidden &&
        post.slug !== slug &&
        (!metadata.translationKey || post.translationKey !== metadata.translationKey)
    )
    .map((post) => {
      const postTags = new Set(Array.isArray(post.tags) ? post.tags : post.tags ? [post.tags] : []);
      const currentTags = Array.isArray(metadata.tags) ? metadata.tags : metadata.tags ? [metadata.tags] : [];
      const sharedTags = currentTags.filter((tag) => postTags.has(tag)).length;
      const sameCategory = metadata.category && post.category === metadata.category ? 1 : 0;
      const sameDate = metadata.date === post.date ? 1 : 0;
      return { post, score: sharedTags * 4 + sameCategory * 2 + sameDate };
    })
    .sort((a, b) => b.score - a.score || b.post.date.localeCompare(a.post.date) || a.post.slug.localeCompare(b.post.slug))
    .slice(0, 3)
    .map(({ post }) => post);

  return (
    <main className="article-shell">
      <article className="article">
        <BlogPostJsonLd
          url={postUrl}
          title={metadata.title}
          datePublished={metadata.date}
          authorName={profile.name}
          description={metadata.excerpt || metadata.description || metadata.title}
          keywords={metadata.keywords}
          section={metadata.category}
          lang={metadata.lang}
        />

        {isFullStory && <ProfileCallout variant="top" />}

        <header className="article__head">
          <T k="blog.writing" as="p" className="brutal-kicker" />
          <h1 className="article__title">{metadata.title}</h1>

          <div className="article__meta">
            <LocalizedDate iso={metadata.date} />

            {metadata.category ? <span>{metadata.category}</span> : null}

            {/* Language versions of this article live under one translationKey:
                switching language keeps the visitor on the same content. */}
            {metadata.lang ? (
              Object.keys(metadata.alternates ?? {}).length > 1 ? (
                Object.entries(metadata.alternates ?? {}).map(([lang, siblingSlug]) => {
                  const label = lang === 'zh' ? '中文' : 'English';
                  const isCurrent = siblingSlug === decodedSlug;

                  return isCurrent ? (
                    <span key={lang} className="post-badge post-badge--yellow">
                      {label}
                    </span>
                  ) : (
                    <Link key={lang} href={`/blog/${siblingSlug}`} className="post-badge">
                      {label}
                    </Link>
                  );
                })
              ) : (
                <span className="post-badge">
                  {metadata.lang === 'zh' ? '仅中文' : 'English only'}
                </span>
              )
            ) : null}

            {metadata.tags && metadata.tags.length > 0
              ? (Array.isArray(metadata.tags) ? metadata.tags : [metadata.tags]).map((tag) => (
                  <span key={tag} className="post-badge">
                    {tag}
                  </span>
                ))
              : null}
          </div>

          <div style={{ marginTop: '16px' }}>
            <ShareButton
              title={metadata.title}
              url={postUrl}
              text={`Check out this blog post: ${metadata.title}`}
            />
          </div>
        </header>

        <div className="article-body">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeRaw, rehypeSanitize, [rehypeKatex, { strict: false }]]}
            components={{
              code: ({ node, className, children, ...props }: any) => {
                const match = /language-(\w+)/.exec(className || '');
                const language = match ? match[1] : className?.replace('language-', '') || '';
                const codeContent = String(children).replace(/\n$/, '');
                if (language === 'mermaid') {
                  return <MermaidBlock chart={codeContent} className={className} />;
                }
                if (language === 'latex' || language === 'math' || language === 'katex') {
                  return <MathBlock math={codeContent} className={className} />;
                }
                if (!match && !String(children).includes('\n')) {
                  return <InlineCode {...props}>{children}</InlineCode>;
                }
                return (
                  <CodeBlock className={className}>
                    {codeContent}
                  </CodeBlock>
                );
              },
              pre: ({ children }) => <pre>{children}</pre>,
              // Headings carry the ids the TOC links to.
              h1: (props: any) => <ArticleHeading as="h1" {...props} />,
              h2: (props: any) => <ArticleHeading as="h2" {...props} />,
              h3: (props: any) => <ArticleHeading as="h3" {...props} />,
              h4: (props: any) => <ArticleHeading as="h4" {...props} />,
              h5: (props: any) => <ArticleHeading as="h5" {...props} />,
              h6: (props: any) => <ArticleHeading as="h6" {...props} />,
            }}
          >
            {content}
          </ReactMarkdown>
        </div>

        <ProfileCallout variant="bottom" />
        <section className="brutal-card" style={{ marginTop: 28 }} aria-labelledby="related-posts-title">
          <h2 id="related-posts-title" className="brutal-title">
            {metadata.lang === 'zh' ? '相关文章' : 'Related posts'}
          </h2>
          <div className="post-list">
            {relatedPosts.map((post) => (
              <Link key={post.slug} className="post-card" href={`/blog/${post.slug}`}>
                <div className="post-card__meta">
                  <LocalizedDate iso={post.date} />
                  {post.category ? <span>{post.category}</span> : null}
                </div>
                <h3 className="post-card__title">{post.title}</h3>
              </Link>
            ))}
          </div>
        </section>
      </article>

      <aside className="article-toc">
        <T k="blog.onThisPage" as="p" className="article-toc__title" />
        <TOC content={content} />
      </aside>
    </main>
  );
}
