import { getPostBySlug, getAllPosts } from '../../../lib/api';
import { format } from 'date-fns';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  
  return {
    title: post.title,
    description: post.excerpt,
  };
}

export default function Post({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  
  return (
    <div className="container">
      <article>
        <h1>{post.title}</h1>
        <div className="post-date">
          {format(new Date(post.date), 'MMMM dd, yyyy')}
        </div>
        {/* biome-ignore lint/security/noDangerouslySetInnerHtml: <explanation> */}
        <div className="post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </div>
  );
}
