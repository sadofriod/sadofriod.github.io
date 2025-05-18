import { Container, Grid } from '@mui/material';
import PostList from '../components/PostList';
import { getAllPostIds } from '../lib/posts';
import UserProfile from '@/components/UserProfile';
import PostProfile from '@/components/PostProfile';

export default function Home() {
  const posts = getAllPostIds();

  return (
    <Container>
      <Grid container sx={{ my: 4 }} gap={2}>
        <Grid item flex={1}>
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
        <Grid flex={3}>
          <PostProfile posts={posts} />
        </Grid>
      </Grid>

      <PostList posts={posts} />
    </Container>
  );
}
