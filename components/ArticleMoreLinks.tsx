import Link from 'next/link';
import { getAllPostIds, type PostMetadata } from '@/lib/posts';

type ArticleMoreLinksProps = {
  current: Pick<PostMetadata, 'slug' | 'date' | 'lang' | 'tags' | 'translationKey'>;
};

export default function ArticleMoreLinks({ current }: ArticleMoreLinksProps) {
  const posts = getAllPostIds()
    .filter((post) => !post.isHidden)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime() || a.slug.localeCompare(b.slug));
  const sameLanguagePosts = posts.filter((post) => post.lang === current.lang);
  const currentIndex = sameLanguagePosts.findIndex((post) => post.slug === current.slug);
  const previous = currentIndex >= 0 ? sameLanguagePosts[currentIndex + 1] : undefined;
  const next = currentIndex > 0 ? sameLanguagePosts[currentIndex - 1] : undefined;
  const adjacentPosts = [current, previous, next].filter((post): post is PostMetadata => Boolean(post));
  const adjacentSlugs = new Set(adjacentPosts.map((post) => post.slug));
  const adjacentTranslationKeys = new Set(
    adjacentPosts.map((post) => post.translationKey).filter((key): key is string => Boolean(key))
  );
  const currentTags = new Set(Array.isArray(current.tags) ? current.tags : current.tags ? [current.tags] : []);
  const related = posts
    .filter(
      (post) =>
        !adjacentSlugs.has(post.slug) &&
        (!post.translationKey || !adjacentTranslationKeys.has(post.translationKey))
    )
    .map((post) => {
      const tags = Array.isArray(post.tags) ? post.tags : post.tags ? [post.tags] : [];
      return { post, sharedTags: tags.filter((tag) => currentTags.has(tag)).length };
    })
    .filter(({ sharedTags }) => sharedTags > 0)
    .sort(
      (a, b) =>
        b.sharedTags - a.sharedTags ||
        new Date(b.post.date).getTime() - new Date(a.post.date).getTime() ||
        a.post.slug.localeCompare(b.post.slug)
    )
    .slice(0, 3)
    .map(({ post }) => post);

  return (
    <nav aria-label="More articles" className="brutal-card" style={{ marginTop: 28 }}>
      {previous || next ? (
        <section>
          <h2 className="brutal-title">PREVIOUS / NEXT</h2>
          <ul className="post-list">
            {previous ? (
              <li>
                <Link className="post-card" href={`/blog/${previous.slug}`}>
                  PREVIOUS: {previous.title}
                </Link>
              </li>
            ) : null}
            {next ? (
              <li>
                <Link className="post-card" href={`/blog/${next.slug}`}>
                  NEXT: {next.title}
                </Link>
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}
      {related.length > 0 ? (
        <section>
          <h2 className="brutal-title">RELATED</h2>
          <ul className="post-list">
            {related.map((post) => (
              <li key={post.slug}>
                <Link className="post-card" href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </nav>
  );
}
