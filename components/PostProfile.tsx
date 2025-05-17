'use client';
import type { PostMetadata } from "@/lib/posts";
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Box,
  Typography,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
  Card,
  CardContent,
  useTheme
} from '@mui/material';
import { FolderOutlined, DescriptionOutlined } from '@mui/icons-material';

type CategoryCount = {
  name: string;
  count: number;
}

const PostProfile: React.FC<{ posts: PostMetadata[] }> = ({
  posts: sourcePosts
}) => {
  const [categories, setCategories] = useState<CategoryCount[]>([]);
  const [totalPosts, setTotalPosts] = useState<number>(0);
  const theme = useTheme();
  const posts = useMemo(
    () => sourcePosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [sourcePosts]
  );
  useEffect(() => {
    // Group posts by category and count them
    const categoryMap = new Map<string, number>();
    for (const post of posts) {
      if (post.category) {
        const currentCount = categoryMap.get(post.category) || 0;
        categoryMap.set(post.category, currentCount + 1);
      }
    }
    // Convert map to array and sort by count (descending)
    const categoriesArray = Array.from(categoryMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    setCategories(categoriesArray);
    setTotalPosts(posts.length);
  }, [posts]);
  
  return (
    <Card sx={{ borderRadius: 2, flex:1 }}>
      <CardContent>
        <Typography variant="h5" component="h3" gutterBottom fontWeight="bold" color="primary">
          Blog Statistics
        </Typography>

        <Box mb={2}>
          <Typography variant="body1">
            Total Posts: <Box component="span" fontWeight="bold" color="primary.main">{totalPosts}</Box>
          </Typography>
        </Box>

        <Box mb={2}>
          <Typography variant="h6" gutterBottom fontWeight="medium" display="flex" alignItems="center">
            <FolderOutlined sx={{ mr: 1 }} /> Categories
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {categories.length > 0 ? (
              categories.map((category) => (
                <Link href={`/category/${category.name}`} key={category.name} passHref style={{ textDecoration: 'none' }}>
                  <Chip
                    label={
                      <Box display="flex" alignItems="center">
                        {category.name}
                        <Box
                          component="span"
                          ml={0.75}
                          bgcolor={theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)'}
                          px={0.8}
                          py={0.2}
                          borderRadius="10px"
                          fontSize="0.75rem"
                        >
                          {category.count}
                        </Box>
                      </Box>
                    }
                    clickable
                    color="primary"
                    variant="outlined"
                    sx={{
                      borderRadius: '16px',
                      '&:hover': {
                        backgroundColor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(33, 150, 243, 0.08)'
                      }
                    }}
                  />
                </Link>
              ))
            ) : (
              <Typography variant="body2" color="text.secondary">No categories found</Typography>
            )}
          </Box>
        </Box>

        {posts.length > 0 && (
          <>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom fontWeight="medium" display="flex" alignItems="center">
              <DescriptionOutlined sx={{ mr: 1 }} /> Recent Posts
            </Typography>
            <List dense>
              {posts.slice(0, 2).map((post) => (
                <ListItem
                  key={post.slug}
                  component={Link}
                  href={`/blog/${post.slug}`}
                  sx={{
                    px: 1,
                    borderRadius: 1,
                    '&:hover': {
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(144, 202, 249, 0.08)' : 'rgba(33, 150, 243, 0.08)',
                      color: 'primary.main'
                    }
                  }}
                >
                  <ListItemText
                    primary={post.title}
                    primaryTypographyProps={{
                      variant: 'body2',
                      style: { fontWeight: 500 }
                    }}
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default PostProfile;