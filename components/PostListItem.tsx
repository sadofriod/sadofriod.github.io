import type { PostMetadata } from "@/lib/posts";
import type React from "react";
import Link from "next/link";
import LocalizedDate from '@/components/LocalizedDate';

const langLabel = (lang: string) => (lang === 'zh' ? '中文' : 'English');

const PostListItem: React.FC<PostMetadata> = ({ title, date, excerpt, tags, description, category, slug, lang, alternates }) => {
  const languageCount = alternates ? Object.keys(alternates).length : 0;
  const languageLabel = lang === 'zh' ? '中 / EN' : 'EN / 中';
  const blurb = description || excerpt;
  const otherLangs = alternates
    ? Object.entries(alternates).filter(([altLang, altSlug]) => altLang !== lang && altSlug && altSlug !== slug)
    : [];

  return (
    <div className="post-card">
      <Link className="post-card__body" href={`/blog/${slug}`}>
        <div className="post-card__meta">
          <LocalizedDate iso={date} />
          {category && <span>{category}</span>}
          {languageCount > 1 && (
            <span className="post-badge post-badge--blue">{languageLabel}</span>
          )}
        </div>

        <h3 className="post-card__title">{title}</h3>

        {blurb && <p className="post-card__desc">{blurb}</p>}

        {tags && tags.length > 0 && (
          <div className="post-card__tags">
            {tags.map(tag => (
              <span className="post-badge" key={tag}>{tag}</span>
            ))}
          </div>
        )}
      </Link>

      {otherLangs.length > 0 && (
        <div className="post-card__langs">
          {otherLangs.map(([altLang, altSlug]) => (
            <Link key={altLang} className="post-card__lang-link" href={`/blog/${altSlug}`}>
              {langLabel(altLang)}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostListItem;
