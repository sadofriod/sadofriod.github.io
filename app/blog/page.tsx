import PostList from "@/components/PostList";
import { getAllPostIds } from "@/lib/posts";
import { Container } from "@mui/material";

export default function Blog() {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <PostList posts={getAllPostIds()} />
    </Container>
  )
}