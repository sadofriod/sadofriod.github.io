'use client';

import Link from 'next/link';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';

export default function PhotoUploadPage() {
  const [authKey, setAuthKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');

  useEffect(() => {
    const key =
      new URLSearchParams(window.location.search).get('authKey') || sessionStorage.getItem('upload_auth') || '';
    setAuthKey(key);
  }, []);

  const onPick = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : '');
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get('file');

    if (!(file instanceof File) || file.size === 0) {
      setError('Pick an image first.');
      return;
    }
    if (!authKey) {
      setError('Missing upload key — open this page as /photography/upload?authKey=… once, or sign in through /podcast?authKey=…');
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');

    try {
      data.set('authKey', authKey);

      // Dimensions come from the browser so the Worker never has to decode the image.
      try {
        const bitmap = await createImageBitmap(file);
        data.set('width', String(bitmap.width));
        data.set('height', String(bitmap.height));
      } catch {
        // Non-fatal: the row just records 0×0 and the gallery falls back to natural sizing.
      }

      const response = await fetch('/api/photos', { method: 'POST', body: data });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || `Upload failed (${response.status})`);
      }

      form.reset();
      setPreview('');
      setMessage('Uploaded — it is live in the gallery now.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="profile-shell">
      <header className="brutal-card brutal-card--yellow">
        <p className="brutal-kicker">Photography · admin</p>
        <h1 className="profile-hero__name">Upload a frame</h1>
        <p className="profile-hero__tagline">
          Original goes to R2, metadata to Postgres, previews are generated at the edge.
        </p>
        <div className="profile-hero__actions">
          <Link className="brutal-btn" href="/photography">
            ← Back to the gallery
          </Link>
        </div>
      </header>

      {error ? (
        <div className="profile-callout" role="alert">
          <span className="brutal-kicker">Error</span>
          <span>{error}</span>
        </div>
      ) : null}

      {message ? (
        <div className="profile-callout profile-callout--bottom" role="status">
          <span className="brutal-kicker">Done</span>
          <span>{message}</span>
        </div>
      ) : null}

      <form className="brutal-card profile-section" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>Image file *</span>
            <input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onPick} required />
          </label>

          <label className="form-field">
            <span>Title</span>
            <input type="text" name="title" placeholder="Morning fog, Hangzhou" maxLength={120} />
          </label>

          <label className="form-field">
            <span>Collection</span>
            <input type="text" name="collection" placeholder="street" maxLength={40} defaultValue="street" />
          </label>

          <label className="form-field">
            <span>Taken on</span>
            <input type="date" name="takenOn" />
          </label>

          <label className="form-field">
            <span>Tags (comma separated)</span>
            <input type="text" name="tags" placeholder="film, 35mm" maxLength={120} />
          </label>

          <label className="form-field">
            <span>Sort order</span>
            <input type="number" name="sortOrder" defaultValue={0} step={1} />
          </label>

          <label className="form-field form-field--wide">
            <span>Description</span>
            <textarea name="description" rows={3} maxLength={600} placeholder="Where it was, what it felt like." />
          </label>
        </div>

        {preview ? (
          <div className="form-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="Selected photo preview" />
          </div>
        ) : null}

        <div className="profile-hero__actions">
          <button className="brutal-btn brutal-btn--ink" type="submit" disabled={busy}>
            {busy ? 'Uploading…' : 'Upload'}
          </button>
        </div>
      </form>
    </main>
  );
}
