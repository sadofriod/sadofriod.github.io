'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';

export default function PodcastUploadPage() {
  const [authKey, setAuthKey] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const storedKey = sessionStorage.getItem('upload_auth') || '';
    setAuthKey(storedKey);
    setAuthenticated(Boolean(storedKey));
  }, []);

  const authenticate = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const response = await fetch('/api/auth/upload', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ key: authKey }),
    });
    if (!response.ok) {
      setMessage('Invalid upload key');
      return;
    }
    sessionStorage.setItem('upload_auth', authKey);
    setAuthenticated(true);
    setMessage('');
  };

  const upload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    formData.set('authKey', authKey);
    try {
      const response = await fetch('/api/podcasts', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Upload failed');
      formElement.reset();
      setMessage('Episode uploaded successfully.');
    } catch (cause) {
      setMessage(cause instanceof Error ? cause.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  if (!authenticated) {
    return (
      <main className="profile-shell">
        <header className="brutal-card brutal-card--yellow">
          <p className="brutal-kicker">Podcast · admin</p>
          <h1 className="profile-hero__name">Podcast upload</h1>
          <p className="brutal-text">Paste the upload key to unlock the episode form.</p>
        </header>

        {message ? (
          <div className="profile-callout" role="alert">
            <span className="brutal-kicker">Error</span>
            <span>{message}</span>
          </div>
        ) : null}

        <form className="brutal-card profile-section" onSubmit={authenticate}>
          <div className="form-grid">
            <label className="form-field form-field--wide">
              <span>Upload key</span>
              <input type="password" value={authKey} onChange={(event) => setAuthKey(event.target.value)} required />
            </label>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 18 }}>
            <button type="submit" className="brutal-btn brutal-btn--ink">
              Authenticate
            </button>
          </div>
        </form>
      </main>
    );
  }

  return (
    <main className="profile-shell">
      <header className="brutal-card brutal-card--yellow">
        <p className="brutal-kicker">Podcast · admin</p>
        <h1 className="profile-hero__name">Upload episode</h1>
        <p className="brutal-text">Audio lands in R2, metadata lands in the episode feed.</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 18 }}>
          <Link className="brutal-btn" href="/podcast">
            ← Back to episodes
          </Link>
        </div>
      </header>

      {message ? (
        <div
          className={`profile-callout${message.includes('successfully') ? ' profile-callout--bottom' : ''}`}
          role={message.includes('successfully') ? 'status' : 'alert'}
        >
          <span className="brutal-kicker">{message.includes('successfully') ? 'Done' : 'Error'}</span>
          <span>{message}</span>
        </div>
      ) : null}

      <form className="brutal-card profile-section" onSubmit={upload}>
        <div className="form-grid">
          <label className="form-field">
            <span>Title</span>
            <input type="text" name="title" required />
          </label>

          <label className="form-field form-field--wide">
            <span>Description</span>
            <textarea name="description" rows={3} required />
          </label>

          <label className="form-field">
            <span>Duration</span>
            <input type="text" name="duration" placeholder="45:30" required />
          </label>

          <label className="form-field">
            <span>Author</span>
            <input type="text" name="author" />
          </label>

          <label className="form-field">
            <span>Episode number</span>
            <input type="number" name="episodeNumber" />
          </label>

          <label className="form-field">
            <span>Season</span>
            <input type="number" name="season" />
          </label>

          <label className="form-field form-field--wide">
            <span>Keywords</span>
            <input type="text" name="keywords" placeholder="Separate keywords with commas" />
          </label>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 18 }}>
          <label className="brutal-btn">
            Choose audio file
            <input hidden type="file" name="audio" accept="audio/*" required />
          </label>
          <label className="brutal-btn">
            Choose cover image
            <input hidden type="file" name="image" accept="image/jpeg,image/png,image/webp" />
          </label>
        </div>

        <label className="form-field form-field--wide" style={{ marginTop: 18 }}>
          <span>Video key in R2</span>
          <input type="text" name="videoKey" placeholder="S01E01.mp4" />
        </label>
        <small style={{ display: 'block', marginTop: 6, opacity: 0.7 }}>
          Optional. An object that already exists in the PODCASTS bucket.
        </small>

        <label className="brutal-checkbox" style={{ marginTop: 16 }}>
          <input type="checkbox" name="explicit" value="true" /> Explicit content
        </label>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 22 }}>
          <button type="submit" className="brutal-btn brutal-btn--ink" disabled={busy}>
            {busy ? 'Uploading…' : 'Upload episode'}
          </button>
        </div>
      </form>
    </main>
  );
}
