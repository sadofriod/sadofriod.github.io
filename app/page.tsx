import { Container, Typography, Box } from '@mui/material';
import PostList from '../components/PostList';
import { getAllPostIds } from '../lib/posts';

export default function Home() {
  const posts = getAllPostIds();
  
  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          My Blog
        </Typography>
        <Typography variant="h6" component="h2" gutterBottom align="center" color="text.secondary">
          Thoughts, ideas, and tech adventures
        </Typography>
        
        <PostList posts={posts} />
      </Box>
    </Container>
  );
}
