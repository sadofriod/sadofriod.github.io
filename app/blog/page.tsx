import PostList from "@/components/PostList";
import { getAllPostIds } from "@/lib/posts";

export default function Blog() {
  return (
    <main className="profile-shell">
      <header className="brutal-card brutal-card--blue" style={{ marginBottom: 28 }}>
        <p className="brutal-kicker">Writing</p>
        <h1 className="profile-hero__name">All writing</h1>
        <p className="brutal-text">
          Essays on remote work, systems, and the long way around hard problems.
        </p>
      </header>

      <PostList posts={getAllPostIds()} />
    </main>
  );
}
