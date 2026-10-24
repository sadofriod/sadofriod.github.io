import PostList from "@/components/PostList";
import T from "@/components/T";
import { getAllPostIds, PostMetadata } from "@/lib/posts";

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
    <main className="profile-shell">
      <header className="brutal-card brutal-card--yellow" style={{ marginBottom: 28 }}>
        <T k="blog.category" as="p" className="brutal-kicker" />
        <h1 className="profile-hero__name">{postCategories}</h1>
      </header>

      <PostList
        posts={filterPostsByCategory(sourcePost, postCategories)}
      />
    </main>
  );
}

export default PostCategoryPage;
