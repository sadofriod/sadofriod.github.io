import type { Metadata } from 'next';
import Link from 'next/link';
import JsonLd from '@/components/JsonLd';
import T from '@/components/T';
import { profile, type SocialIcon } from '@/data/profile';
import { getPostByFile } from '@/lib/posts';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://blog.ashesborn.cloud';

export const metadata: Metadata = {
  title: profile.seo.aboutTitle,
  description: profile.seo.aboutDescription,
  alternates: {
    canonical: `${SITE}/about`,
  },
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

/** Social labels are keyed by icon, not by the English label in data/profile.ts. */
const SOCIAL_KEYS: Record<SocialIcon, string> = {
  github: 'profile.socialGithub',
  mail: 'profile.socialEmail',
  blog: 'profile.socialBlog',
};

/** Writing-group copy lives under profile.group<Name>{Label,Blurb}. */
const GROUP_NAMES: Record<string, string> = {
  graphrag: 'Graphrag',
  engineering: 'Engineering',
  notes: 'Notes',
};

function groupKeys(id: string) {
  const name = GROUP_NAMES[id] ?? 'Engineering';
  return {
    // The graphrag group shares the series copy.
    label: id === 'graphrag' ? 'profile.seriesLabel' : `profile.group${name}Label`,
    blurb: `profile.group${name}Blurb`,
  };
}

/** Project copy is keyed by repo name. */
function projectKeys(name: string) {
  if (name === 'blog.ashesborn.cloud') {
    return { role: 'profile.projectBlogRole', blurb: 'profile.projectBlogBlurb' };
  }
  return { role: 'profile.projectGraphragRole', blurb: 'profile.projectGraphragBlurb' };
}

/** Paragraphs in profile.now, in order. */
const NOW_KEYS = ['profile.now1', 'profile.now2', 'profile.now3'];

export default function AboutPage() {
  const fullStory = getPostByFile(profile.fullStory.file);
  const resumeLinks = profile.resumes.map((item) => ({
    label: item.label,
    post: getPostByFile(item.file),
  }));
  const writingGroups = profile.writingGroups.map((group) => ({
    ...group,
    resolvedPosts: group.posts.map((item) => getPostByFile(item.file)),
  }));
  const github = profile.socials.find((social) => social.icon === 'github');

  return (
    <main className="profile-shell">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'Person',
          name: profile.name,
          alternateName: profile.handle,
          jobTitle: profile.tagline,
          url: `${SITE}/about`,
          image: `${SITE}${profile.avatar}`,
          sameAs: [github?.href, profile.socials.find((social) => social.icon === 'blog')?.href].filter(
            Boolean
          ),
          description: profile.about.now,
          email: profile.contact.email,
        }}
      />

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
            <T as="p" className="brutal-kicker" k="home.profile" />
            <h1 className="profile-hero__name">
              {profile.name} <span className="profile-hero__handle">@{profile.handle}</span>
            </h1>
            <T as="p" className="profile-hero__tagline" k="profile.tagline" />
            <T as="p" className="profile-hero__role" k="profile.role" />

            <div className="profile-hero__actions">
              <a
                className="brutal-pill"
                href={profile.status.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="brutal-pill__dot" aria-hidden="true" />
                <T k="profile.statusLabel" />
                <span className="brutal-muted">
                  · <T k="profile.statusDetail" />
                </span>
              </a>
            </div>

            <div className="profile-social">
              {profile.socials.map((social) => (
                <a key={social.label} href={social.href}>
                  {socialIcon(social.icon)}
                  <T k={SOCIAL_KEYS[social.icon]} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section__head">
          <T className="brutal-kicker" k="about.story" />
          <T as="h2" k="about.howIGotHere" />
        </div>
        <div className="story">
          <div className="story__item">
            <T className="brutal-kicker" k="about.stepStart" />
            <T as="p" k="profile.aboutStart" />
          </div>
          <div className="story__item">
            <T className="brutal-kicker" k="about.stepTurn" />
            <T as="p" k="profile.aboutTurn" />
          </div>
          <div className="story__item">
            <T className="brutal-kicker" k="about.stepNow" />
            <T as="p" k="profile.aboutNow" />
          </div>
        </div>
      </section>

      <section className="profile-section">
        <div className="brutal-card brutal-card--mint">
          <T as="p" className="brutal-kicker" k="profile.fullStoryLabel" />
          <h2 className="brutal-title">
            <Link className="brutal-link" href={`/blog/${fullStory.slug}`}>
              {fullStory.title}
            </Link>
          </h2>
          <T as="p" className="brutal-text brutal-muted" k="profile.fullStoryNote" />
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section__head">
          <T className="brutal-kicker" k="home.now" />
          <T as="h2" k="about.whatIAmDoing" />
        </div>
        <div className="brutal-card">
          <ul className="now-list">
            {NOW_KEYS.map((key) => (
              <li key={key}>
                <T k={key} />
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section__head">
          <T className="brutal-kicker" k="about.selectedWork" />
          <T as="h2" k="about.writingProjects" />
        </div>

        <div className="work-list">
          {writingGroups.map((group) => (
            <div className="brutal-card" key={group.id}>
              <T as="h3" className="brutal-title" k={groupKeys(group.id).label} />
              <T as="p" className="brutal-text brutal-muted" k={groupKeys(group.id).blurb} />
              <ul>
                {group.resolvedPosts.map((post) => (
                  <li key={post.slug}>
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </li>
                ))}
              </ul>
              {group.moreHref ? (
                <p className="bento__more">
                  <Link className="brutal-link" href={group.moreHref}>
                    <T k="about.moreInCategory" />
                  </Link>
                </p>
              ) : null}
            </div>
          ))}
        </div>

        <div className="profile-stack">
          {profile.projects.map((project) => (
            <div className="brutal-card brutal-card--blue" key={project.name}>
              <h3 className="brutal-title">{project.name}</h3>
              <span className="work-list__meta">
                <T k={projectKeys(project.name).role} /> · {project.meta}
              </span>
              <T as="p" className="brutal-text" k={projectKeys(project.name).blurb} />
              <a
                className="brutal-link"
                href={project.href}
                target="_blank"
                rel="noopener noreferrer"
              >
                <T k="about.open" />
              </a>
            </div>
          ))}
        </div>

        <div className="profile-stack">
          <div className="brutal-card brutal-card--tight">
            <T as="p" className="brutal-kicker" k="home.resume" />
            <div className="contact-row">
              {resumeLinks.map((item) => (
                <Link key={item.post.slug} className="brutal-btn" href={`/blog/${item.post.slug}`}>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="profile-section">
        <div className="profile-section__head">
          <T className="brutal-kicker" k="about.contact" />
          <T as="h2" k="about.sayHi" />
        </div>
        <div className="brutal-card">
          <div className="contact-row">
            <a className="brutal-btn brutal-btn--ink" href={profile.contact.emailHref}>
              {profile.contact.email}
            </a>
            {github ? (
              <a className="brutal-btn" href={github.href} target="_blank" rel="noopener noreferrer">
                GitHub →
              </a>
            ) : null}
          </div>
        </div>
      </section>
    </main>
  );
}
