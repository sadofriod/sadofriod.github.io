import Link from 'next/link';

type ProfileCalloutProps = {
  variant: 'top' | 'bottom';
};

/**
 * Server Component. Pure CSS, zero client JS.
 * Links the long-form retrospective back to the short profile narrative and
 * gives every article a way out to the identity pages.
 */
export default function ProfileCallout({ variant }: ProfileCalloutProps) {
  if (variant === 'top') {
    return (
      <aside className="profile-callout">
        <span className="brutal-kicker">Full version</span>
        <span>
          This is the full version of the story. If you want the short one first, read the{' '}
          <Link href="/about">About page</Link>.
        </span>
      </aside>
    );
  }

  return (
    <aside className="profile-callout profile-callout--bottom">
      <span className="brutal-kicker">Keep going</span>
      <span>
        Want to know what I am working on now? <Link href="/about">About</Link>
        {' · '}
        <Link href="/photography">Photography</Link>
        {' · '}
        <Link href="/blog">All writing</Link>
      </span>
    </aside>
  );
}
