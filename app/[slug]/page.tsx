import { getAllPostIds, getPostData } from '../../lib/posts';
import type { Metadata } from 'next';
import ReactMarkdown from 'react-markdown';
// Add other imports as needed

// Generate static paths
export async function generateStaticParams() {
  const paths = getAllPostIds();
  return paths;
}

// Generate metadata for the page
export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const postData = getPostData(params.slug);
  return {
    title: postData.title,
    description: postData.excerpt || postData.title,
  };
}

export default function Post({ params }: { params: { slug: string } }) {
  const postData = getPostData(params.slug);
  
  return (
    <article>
      <h1>{postData.title}</h1>
      <div>
        <time>{postData.date}</time>
      </div>
      <div>
        <ReactMarkdown>{postData.content}</ReactMarkdown>
      </div>
    </article>
  );
}
