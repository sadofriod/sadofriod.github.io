import { Container, Grid } from '@mui/material';
import PostList from '../components/PostList';
import { getAllPostIds } from '../lib/posts';
import UserProfile from '@/components/UserProfile';
import PostProfile from '@/components/PostProfile';

export default function Home() {
  const posts = getAllPostIds();

  return (
    <Container maxWidth="lg">
      <Grid container sx={{ my: { xs: 2, md: 4 } }} spacing={{ xs: 2, md: 3 }}>
        <Grid item xs={12} md={4} lg={3}>
          <UserProfile
            name="Ashes Born"
            avatar="/avatar.jpg"
            bio="Software engineer with a passion for open-source."
            title="Senior Developer"
            company="Tech Corp"
            social={{
              github: "https://github.com/johndoe",
              twitter: "johndoe",
              email: "justlikeashes@gamil.com"
            }}
          />
        </Grid>
        <Grid item xs={12} md={8} lg={9}>
          <PostProfile posts={posts} />
        </Grid>
      </Grid>

      <PostList posts={posts} />
    </Container>
  );
}
