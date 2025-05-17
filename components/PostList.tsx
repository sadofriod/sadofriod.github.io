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

  const sortPosts = (posts: PostMetadata[]) => {
    switch (sortOrderBy) {
      case SortOrderBy.DATE:
        return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      case SortOrderBy.TITLE:
        return posts.sort((a, b) => a.title.localeCompare(b.title, locale));
      case SortOrderBy.SLUG:
        return posts.sort((a, b) => a.slug.localeCompare(b.slug, locale));
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
          {t('blog.posts')} ({posts.length})
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
        {sortPosts(posts).map((post) => (
          <PostListItem
            {...post}
            key={post.slug}
            date={format(new Date(post.date), dateFormatPattern, { locale: dateLocale })}
          />
        ))}
      </Stack>
    </div>
  );
}
