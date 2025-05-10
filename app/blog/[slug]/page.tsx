import { Container, Typography, Box, Chip, Stack, Divider } from '@mui/material';
import { getAllPostIds, getPostBySlug, getPostData } from '../../../lib/posts';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';

interface PageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { metadata } = getPostBySlug(params.slug);
  
  return {
    title: metadata.title,
    description: metadata.excerpt || metadata.title,
    keywords: metadata.keywords,
  };
}

export async function generateStaticParams() {
  const posts = getAllPostIds();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export default function BlogPost({ params }: PageProps) {
  const { content, slug, ...metadata } = getPostData(params.slug);
  
  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          {metadata.title}
        </Typography>
        
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {new Date(metadata.date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </Typography>
        
        {metadata.tags && metadata.tags.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ my: 2, flexWrap: 'wrap', gap: 1 }}>
            {Array.isArray(metadata.tags) ? 
              metadata.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" />
              )) :
              <Chip label={metadata.tags} size="small" />
            }
          </Stack>
        )}
        
        <Divider sx={{ my: 3 }} />
        
        <Box className="markdown-content" sx={{ mt: 4 }}>
          <ReactMarkdown>{content}</ReactMarkdown>
        </Box>
      </Box>
    </Container>
  );
}
