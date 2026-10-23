'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import type { Podcast } from '@/lib/podcasts';
import PodcastEditDialog from '@/components/PodcastEditDialog';

function uploadKey(): string {
  return new URLSearchParams(window.location.search).get('authKey') || sessionStorage.getItem('upload_auth') || '';
}

export default function PodcastPage() {
  const [podcasts, setPodcasts] = useState<Podcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [editing, setEditing] = useState<Podcast | null>(null);

  useEffect(() => {
    const queryKey = new URLSearchParams(window.location.search).get('authKey');
    if (queryKey) sessionStorage.setItem('upload_auth', queryKey);
    setIsAdmin(Boolean(queryKey || sessionStorage.getItem('upload_auth')));
    const load = async () => {
      try {
        const response = await fetch('/api/podcasts');
        if (!response.ok) throw new Error('Could not load episodes');
        setPodcasts(await response.json());
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : 'Could not load episodes');
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, []);

  const refresh = async () => {
    const response = await fetch('/api/podcasts');
    if (!response.ok) throw new Error('Could not refresh episodes');
    setPodcasts(await response.json());
  };

  const remove = async (podcast: Podcast) => {
    if (!window.confirm(`Delete “${podcast.metadata.title}”?`)) return;
    const response = await fetch(`/api/podcasts/${podcast.id}`, {
      method: 'DELETE',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ authKey: uploadKey() }),
    });
    if (!response.ok) {
      setError('Could not delete this episode');
      return;
    }
    await refresh();
  };

  const save = async (formData: FormData) => {
    const response = await fetch(`/api/podcasts/${editing?.id}`, { method: 'PATCH', body: formData });
    if (!response.ok) throw new Error('Could not update this episode');
    await refresh();
  };

  return (
    <main className="profile-shell">
      <header className="brutal-card brutal-card--yellow">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 18, justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ minWidth: 0 }}>
            <p className="brutal-kicker">Podcast</p>
            <h1 className="profile-hero__name">Podcast</h1>
            <p className="brutal-text">Episodes from Ashes Space — audio, video and show notes, straight from the feed.</p>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <a className="brutal-btn" href="/podcast/rss" target="_blank" rel="noreferrer">
              RSS
            </a>
            {isAdmin ? (
              <Link className="brutal-btn brutal-btn--ink" href="/podcast/upload">
                Upload
              </Link>
            ) : null}
          </div>
        </div>
      </header>

      {error ? (
        <div className="profile-callout" role="alert">
          <span className="brutal-kicker">Error</span>
          <span>{error}</span>
        </div>
      ) : null}

      {loading ? <p className="brutal-kicker">Loading episodes…</p> : null}

      {!loading && !error && podcasts.length === 0 ? (
        <div className="podcast-empty">
          <p className="brutal-kicker">Empty feed</p>
          <p className="brutal-text">No episodes have been published yet.</p>
        </div>
      ) : null}

      <div className="podcast-list">
        {podcasts.map((podcast) => (
          <article className="podcast-card" key={podcast.id}>
            <div className="podcast-card__head">
              {podcast.metadata.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img className="podcast-card__cover" src={podcast.metadata.image} alt="" />
              ) : null}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 className="podcast-card__title">{podcast.metadata.title}</h2>
                <p className="podcast-card__meta">
                  {podcast.metadata.date} · {podcast.metadata.duration}
                  {podcast.metadata.author ? ` · ${podcast.metadata.author}` : ''}
                  {podcast.metadata.explicit ? ' · Explicit' : ''}
                </p>
                <p className="brutal-text">{podcast.metadata.description}</p>
              </div>
            </div>

            {podcast.metadata.videoUrl ? (
              <video
                className="podcast-media"
                controls
                playsInline
                preload="none"
                poster={podcast.metadata.image}
                src={podcast.metadata.videoUrl}
              />
            ) : null}

            <audio className="podcast-media" controls preload="none" src={podcast.metadata.audioUrl}>
              Audio playback is not supported by this browser.
            </audio>

            {isAdmin ? (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'flex-end', marginTop: 14 }}>
                <button type="button" className="brutal-btn" aria-label="Edit episode" onClick={() => setEditing(podcast)}>
                  Edit
                </button>
                <button type="button" className="brutal-btn" aria-label="Delete episode" onClick={() => void remove(podcast)}>
                  Delete
                </button>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <PodcastEditDialog podcast={editing} open={Boolean(editing)} onClose={() => setEditing(null)} onSave={save} />
    </main>
  );
}
