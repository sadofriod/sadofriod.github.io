import PostList from "@/components/PostList";
import { getAllPostIds, PostMetadata } from "@/lib/posts";
import { Container } from "@mui/material";

interface PageProps {
  params: {
    postCategories: string;
  };
}

const filterPostsByCategory = (posts: PostMetadata[], category: string): PostMetadata[] => {
  return posts.filter(post => post.category === category);
}

const PostCategoryPage: React.FC<PageProps> = ({ params }) => {
  const { postCategories } = params;
  const sourcePost = getAllPostIds();
  return (
    <Container maxWidth="lg" sx={{ my: { xs: 2, md: 4 } }}>
      <PostList
        posts={filterPostsByCategory(sourcePost, postCategories)}
      />
    </Container>
  );
}

export default PostCategoryPage;