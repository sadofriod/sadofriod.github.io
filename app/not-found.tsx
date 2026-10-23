import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="profile-shell">
      <div className="not-found">
        <p className="not-found__code brutal-kicker">404</p>
        <h1 className="brutal-title">Page not found</h1>
        <p className="brutal-text">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
        </p>
        <Link className="brutal-btn" href="/">
          Back home
        </Link>
      </div>
    </main>
  );
}
