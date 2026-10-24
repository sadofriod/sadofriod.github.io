import PostList from "@/components/PostList";
import T from "@/components/T";
import { getAllPostIds } from "@/lib/posts";

export default function Blog() {
  return (
    <main className="profile-shell">
      <header className="brutal-card brutal-card--blue" style={{ marginBottom: 28 }}>
        <T k="blog.writing" as="p" className="brutal-kicker" />
        <T k="blog.allWriting" as="h1" className="profile-hero__name" />
        <T k="blog.tagline" as="p" className="brutal-text" />
      </header>

      <PostList posts={getAllPostIds()} />
    </main>
  );
}
