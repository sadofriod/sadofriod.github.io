'use client';

import Link from 'next/link';
import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

const PREVIEW_MAX_EDGE = 1600;

/** Downscale in the browser so /photos/p/:id can serve a ~200 KB WebP. */
async function renderPreview(bitmap: ImageBitmap): Promise<Blob | null> {
  const scale = Math.min(1, PREVIEW_MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.drawImage(bitmap, 0, 0, width, height);
  return new Promise((resolve) => canvas.toBlob((blob) => resolve(blob), 'image/webp', 0.82));
}

export default function PhotoUploadPage() {
  const { t } = useLanguage();
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

      // Dimensions and the gallery preview both come from the browser, so the
      // Worker never decodes an image and the gallery never serves a 12 MB original.
      try {
        const bitmap = await createImageBitmap(file);
        data.set('width', String(bitmap.width));
        data.set('height', String(bitmap.height));

        const preview = await renderPreview(bitmap);
        if (preview) data.set('preview', preview, 'preview.webp');
      } catch {
        // Non-fatal: the row records 0×0 and /photos/p/:id falls back to the original.
      }

      const response = await fetch('/api/photos', { method: 'POST', body: data });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || `${t('photoForm.uploadFailed')} (${response.status})`);
      }

      form.reset();
      setPreview('');
      setMessage('Uploaded — it is live in the gallery now.');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('photoForm.uploadFailed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="profile-shell">
      <header className="brutal-card brutal-card--yellow">
        <p className="brutal-kicker">{t('photography.adminKicker')}</p>
        <h1 className="profile-hero__name">{t('photography.uploadKicker')}</h1>
        <p className="profile-hero__tagline">
          {t('photography.uploadTagline')}
        </p>
        <div className="profile-hero__actions">
          <Link className="brutal-btn" href="/photography">
            {t('photography.backToGallery')}
          </Link>
        </div>
      </header>

      {error ? (
        <div className="profile-callout" role="alert">
          <span className="brutal-kicker">{t('common.error')}</span>
          <span>{error}</span>
        </div>
      ) : null}

      {message ? (
        <div className="profile-callout profile-callout--bottom" role="status">
          <span className="brutal-kicker">{t('common.done')}</span>
          <span>{message}</span>
        </div>
      ) : null}

      <form className="brutal-card profile-section" onSubmit={onSubmit}>
        <div className="form-grid">
          <label className="form-field">
            <span>{t('photoForm.file')}</span>
            <input type="file" name="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={onPick} required />
          </label>

          <label className="form-field">
            <span>{t('photoForm.title')}</span>
            <input type="text" name="title" placeholder={t('photoForm.titlePlaceholder')} maxLength={120} />
          </label>

          <label className="form-field">
            <span>{t('photoForm.collection')}</span>
            <input type="text" name="collection" placeholder={t('photoForm.collectionPlaceholder')} maxLength={40} defaultValue="street" />
          </label>

          <label className="form-field">
            <span>{t('photoForm.takenOn')}</span>
            <input type="date" name="takenOn" />
          </label>

          <label className="form-field">
            <span>{t('photoForm.tags')}</span>
            <input type="text" name="tags" placeholder="film, 35mm" maxLength={120} />
          </label>

          <label className="form-field">
            <span>{t('photoForm.sortOrder')}</span>
            <input type="number" name="sortOrder" defaultValue={0} step={1} />
          </label>

          <label className="form-field form-field--wide">
            <span>{t('photoForm.description')}</span>
            <textarea name="description" rows={3} maxLength={600} placeholder={t('photoForm.descriptionPlaceholder')} />
          </label>
        </div>

        {preview ? (
          <div className="form-preview">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt={t('photoForm.preview')} />
          </div>
        ) : null}

        <div className="profile-hero__actions">
          <button className="brutal-btn brutal-btn--ink" type="submit" disabled={busy}>
            {busy ? t('photoForm.uploading') : t('photoForm.submit')}
          </button>
        </div>
      </form>
    </main>
  );
}
