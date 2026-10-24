import Link from 'next/link';
import T from '@/components/T';

export default function NotFound() {
  return (
    <main className="profile-shell">
      <div className="not-found">
        <p className="not-found__code brutal-kicker">404</p>
        <T k="notFound.title" as="h1" className="brutal-title" />
        <T k="notFound.body" as="p" className="brutal-text" />
        <Link className="brutal-btn" href="/">
          <T k="notFound.backHome" />
        </Link>
      </div>
    </main>
  );
}
