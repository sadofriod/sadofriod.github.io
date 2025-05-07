import React from 'react';
import Link from 'next/link';
import { Card, CardContent, Typography, Grid, Chip, Stack } from '@mui/material';
import type { PostMetadata } from '../lib/posts';

interface PostListProps {
  posts: PostMetadata[];
}

export default function PostList({ posts }: PostListProps) {
  return (
    <Grid container spacing={4} sx={{ mt: 2 }}>
      {posts.map((post) => (
        <Grid item xs={12} sm={6} md={4} key={post.slug}>
          <Link href={`/blog/${post.slug}`} style={{ textDecoration: 'none' }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography variant="h5" component="h2" gutterBottom>
                  {post.title}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Typography>
                {post.excerpt && (
                  <Typography variant="body2" paragraph>
                    {post.excerpt}
                  </Typography>
                )}
                {post.tags && post.tags.length > 0 && (
                  <Stack direction="row" spacing={1} sx={{ mt: 2, flexWrap: 'wrap', gap: 1 }}>
                    {Array.isArray(post.tags) ? 
                      post.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" />
                      )) :
                      <Chip label={post.tags} size="small" />
                    }
                  </Stack>
                )}
              </CardContent>
            </Card>
          </Link>
        </Grid>
      ))}
    </Grid>
  );
}
