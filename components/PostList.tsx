'use client';

import React from 'react';
import type { PostMetadata } from '../lib/posts';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { format } from 'date-fns';
import type { Locale } from 'date-fns';
import { enUS, zhCN, ja } from 'date-fns/locale';
import PostListItem from './PostListItem';

interface PostListProps {
  posts: PostMetadata[];
}

enum SortOrderBy {
  DATE = 0,
  TITLE = 1,
  SLUG = 2,
}

export default function PostList({ posts }: PostListProps) {
  const { locale, t } = useLanguage();
  const [sortOrderBy, setSortOrderBy] = React.useState<SortOrderBy>(SortOrderBy.DATE);

  // Language versions of one article are a single entry: show the one matching
  // the visitor's locale, else the canonical (English) copy.
  const localizedPosts = React.useMemo(() => {
    const groups = new Map<string, PostMetadata[]>();

    for (const post of posts) {
      const key = post.translationKey || post.slug;
      const group = groups.get(key);
      if (group) group.push(post);
      else groups.set(key, [post]);
    }

    return Array.from(groups.values()).map(
      (group) => group.find((post) => post.lang === locale) ?? group.find((post) => post.isPrimary) ?? group[0]
    );
  }, [posts, locale]);

  // Map locale to date-fns locale
  const localeMap: Record<string, Locale> = {
    'en': enUS,
    'zh': zhCN,
    'ja': ja
  };
  const dateLocale = localeMap[locale] || enUS;
  // Get date format pattern based on locale
  const dateFormatPattern = t('common.dateFormat');

  const handleSortChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSortOrderBy(Number(event.target.value) as SortOrderBy);
  };

  const sortPosts = (items: PostMetadata[]) => {
    switch (sortOrderBy) {
      case SortOrderBy.DATE:
        return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case SortOrderBy.TITLE:
        return items.sort((a, b) => a.title.localeCompare(b.title, locale));
      case SortOrderBy.SLUG:
        return items.sort((a, b) => a.slug.localeCompare(b.slug, locale));
      default:
        return posts;
    }
  };

  return (
    <div className="post-list">
      <div className="post-list__head">
        <h2 className="brutal-title">
          {t('blog.posts')} <span className="post-list__count">({localizedPosts.length})</span>
        </h2>

        <select
          className="brutal-select"
          aria-label={t('common.sortBy')}
          value={sortOrderBy}
          onChange={handleSortChange}
        >
          <option value={SortOrderBy.DATE}>{t('common.sortByDate')}</option>
          <option value={SortOrderBy.TITLE}>{t('common.sortByTitle')}</option>
          <option value={SortOrderBy.SLUG}>{t('common.sortBySlug')}</option>
        </select>
      </div>

      {sortPosts(localizedPosts).filter((post) => !post.isHidden).map((post) => {
        const postDate = new Date(post.date);
        const isValidDate = post.date && !isNaN(postDate.getTime());
        const formattedDate = isValidDate
          ? format(postDate, dateFormatPattern, { locale: dateLocale })
          : post.date || 'No date';

        return (
          <PostListItem
            {...post}
            key={post.slug}
            date={formattedDate}
          />
        );
      })}
    </div>
  );
}
