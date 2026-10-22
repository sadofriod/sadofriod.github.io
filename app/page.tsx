import type { Metadata } from 'next';
import Link from 'next/link';
import PostList from '@/components/PostList';
import { getAllPostIds, getPostByFile } from '@/lib/posts';
import { profile, type SocialIcon } from '@/data/profile';

// Photography module: pending photo assets + routing decision (design doc §7.1 / §7.2).

export const metadata: Metadata = {
  title: 'Ashes Born — Independent engineer building GraphRAG systems',
  description: profile.seo.aboutDescription,
};

function socialIcon(icon: SocialIcon) {
  switch (icon) {
    case 'github':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">
          <path d="M12 .5C5.73.5.5 5.73.5 12a11.5 11.5 0 0 0 7.86 10.92c.58.1.79-.25.79-.56v-2c-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.56-.29-5.25-1.28-5.25-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.4-5.26 5.69.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5Z" />
        </svg>
      );
    case 'mail':
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2.5" y="5" width="19" height="14" rx="2" />
          <path d="m3 7 9 6 9-6" />
        </svg>
      );
    case 'blog':
    default:
      return (
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
          <path d="M7.5 8.5h9M7.5 12h9M7.5 15.5h5" />
        </svg>
      );
  }
}

export default function Home() {
  const posts = getAllPostIds();
  const series = profile.graphragSeries.posts.map((item) => getPostByFile(item.file));
  const groups = profile.writingGroups.map((group) => ({
    ...group,
    resolvedPosts: group.posts.map((item) => getPostByFile(item.file)),
  }));
  const resumes = profile.resumes.map((item) => ({
    label: item.label,
    post: getPostByFile(item.file),
  }));

  return (
    <main className="profile-shell">
      {/* Identity layer: who this is, what he is building, where the proof is. */}
      <section className="brutal-card brutal-card--yellow">
        <div className="profile-hero">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="profile-hero__avatar"
            src={profile.avatar}
            alt={profile.name}
            width={132}
            height={132}
          />
          <div>
            <p className="brutal-kicker">Profile</p>
            <h1 className="profile-hero__name">
              {profile.name} <span className="profile-hero__handle">@{profile.handle}</span>
            </h1>
            <p className="profile-hero__tagline">{profile.tagline}</p>
            <p className="profile-hero__role">{profile.role}</p>

            <div className="profile-hero__actions">
              <a
                className="brutal-pill"
                href={profile.status.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="brutal-pill__dot" aria-hidden="true" />
                {profile.status.label}
                <span className="brutal-muted">· {profile.status.detail}</span>
              </a>
              <Link className="brutal-btn brutal-btn--ink" href="/blog">
                Read the writing →
              </Link>
              <Link className="brutal-btn" href="/about">
                About
              </Link>
            </div>

            <div className="profile-social">
              {profile.socials.map((social) => (
                <a key={social.label} href={social.href}>
                  {socialIcon(social.icon)}
                  <span>{social.label}</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Evidence layer: each tile is proof of one side of the work. */}
      <div className="bento">
        <section className="brutal-card brutal-card--pink bento__graphrag">
          <p className="brutal-kicker">Proof of work</p>
          <h2 className="brutal-title">{profile.graphragSeries.label}</h2>
          <p className="brutal-text brutal-muted">{profile.graphragSeries.blurb}</p>
          <ul className="bento-list">
            {series.map((post) => (
              <li key={post.slug}>
                <Link href={`/blog/${post.slug}`}>{post.title}</Link>
              </li>
            ))}
          </ul>
          <div className="bento__topics">
            <span>indexing</span>
            <span>communities</span>
            <span>retrieval</span>
            <span>map-reduce</span>
            <span>incremental</span>
          </div>
          <p className="bento__more">
            <Link className="brutal-link" href={`/blog/${series[0].slug}`}>
              start with the design doc →
            </Link>
          </p>
          {profile.graphragSeries.moreHref ? (
            <p className="bento__more">
              <Link className="brutal-link" href={profile.graphragSeries.moreHref}>
                all writing →
              </Link>
            </p>
          ) : null}
        </section>

        <section className="brutal-card bento__writing">
          <p className="brutal-kicker">Writing</p>
          <h2 className="brutal-title">By theme</h2>
          {groups.map((group) => (
            <div className="bento__group" key={group.id}>
              <div className="bento__group-head">
                <Link className="brutal-link" href={group.moreHref ?? '/blog'}>
                  {group.label}
                </Link>
                <span className="bento__count">{group.resolvedPosts.length} posts</span>
              </div>
              <p className="brutal-text brutal-muted">{group.blurb}</p>
            </div>
          ))}
          <p className="bento__more">
            <Link className="brutal-link" href="/blog">
              browse all {posts.length} posts →
            </Link>
          </p>
        </section>

        <section className="brutal-card brutal-card--mint bento__now">
          <p className="brutal-kicker">Now</p>
          <h2 className="brutal-title">Right now</h2>
          <p className="brutal-text">{profile.now[0]}</p>
          <p className="bento__more">
            <Link className="brutal-link" href="/about">
              the full picture →
            </Link>
          </p>
        </section>

        <section className="brutal-card bento__resume">
          <p className="brutal-kicker">Resume</p>
          <h2 className="brutal-title">Hire me</h2>
          <ul className="bento-list">
            {resumes.map((item) => (
              <li key={item.post.slug}>
                <Link href={`/blog/${item.post.slug}`}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="brutal-card brutal-card--blue bento__projects">
          <p className="brutal-kicker">Projects</p>
          <h2 className="brutal-title">Things I maintain</h2>
          <ul className="bento-list">
            {profile.projects.map((project) => (
              <li key={project.name}>
                <a href={project.href} target="_blank" rel="noopener noreferrer">
                  {project.name}
                  <span className="work-list__meta">
                    {project.role} · {project.meta}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="profile-latest">
        <div className="profile-latest__head">
          <span className="brutal-kicker">Latest</span>
          <h2>All writing</h2>
        </div>
        <PostList posts={posts} />
      </section>
    </main>
  );
}
