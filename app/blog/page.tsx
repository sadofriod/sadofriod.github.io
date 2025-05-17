import PostList from "@/components/PostList";
import { getAllPostIds } from "@/lib/posts";

export default function Blog() {
  return (
    <PostList posts={getAllPostIds()} />
  )
}