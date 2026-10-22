'use client';

import React from 'react';
import type { PostMetadata } from '../lib/posts';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { format } from 'date-fns';
import { enUS, zhCN, ja } from 'date-fns/locale';
import PostListItem from './PostListItem';
import {
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  type SelectChangeEvent,
  Typography,
  Stack
} from '@mui/material';
import SortIcon from '@mui/icons-material/Sort';

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

  const handleSortChange = (event: SelectChangeEvent<number>) => {
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
    <div>
      <Box sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        mb: 3,
        flexWrap: 'wrap',
        gap: 2
      }}>
        <Typography variant="h6" component="h2">
          {t('blog.posts')} ({localizedPosts.length})
        </Typography>

        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel id="sort-select-label">{t('common.sortBy')}</InputLabel>
          <Select
            labelId="sort-select-label"
            id="sort-select"
            value={sortOrderBy}
            label={t('common.sortBy')}
            onChange={handleSortChange}
            startAdornment={
              <SortIcon fontSize="small" sx={{ mr: 1, opacity: 0.7 }} />
            }
          >
            <MenuItem value={SortOrderBy.DATE}>{t('common.sortByDate')}</MenuItem>
            <MenuItem value={SortOrderBy.TITLE}>{t('common.sortByTitle')}</MenuItem>
            <MenuItem value={SortOrderBy.SLUG}>{t('common.sortBySlug')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      <Stack spacing={2}>
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
      </Stack>
    </div>
  );
}
