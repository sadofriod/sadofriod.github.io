import PostList from "@/components/PostList";
import { getAllPostIds, PostMetadata } from "@/lib/posts";
import { Container } from "@mui/material";

interface PageProps {
  params: Promise<{
    postCategories: string;
  }>;
}

export function generateStaticParams() {
  const categories = new Set(
    getAllPostIds()
      .map((post) => post.category)
      .filter((category): category is string => Boolean(category))
  );

  return Array.from(categories).map((postCategories) => ({ postCategories }));
}

export const dynamicParams = false;

const filterPostsByCategory = (posts: PostMetadata[], category: string): PostMetadata[] => {
  return posts.filter(post => post.category === category);
}

const PostCategoryPage = async ({ params }: PageProps) => {
  const { postCategories } = await params;
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