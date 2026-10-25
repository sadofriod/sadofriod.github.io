'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { fetchAdminSession, anonymousSession, type AdminSession } from '@/lib/adminSession';
import { metadataToFormFields, parsePhotoMetadata, summarizeMetadata } from '@/lib/photoMetadata';

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
  const { t, locale } = useLanguage();
  const [authKey, setAuthKey] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [preview, setPreview] = useState('');
  const [session, setSession] = useState<AdminSession>(anonymousSession);
  const [formState, setFormState] = useState<Record<string, string>>({ collection: 'street' });
  const [metadataChips, setMetadataChips] = useState<string[]>([]);
  const [metadataDetected, setMetadataDetected] = useState(false);
  const [placeStatus, setPlaceStatus] = useState<'idle' | 'resolving' | 'unavailable'>('idle');
  const touched = useRef(new Set<string>());
  const geocodeController = useRef<AbortController | null>(null);

  const updateField = (name: string, value: string) => {
    touched.current.add(name);
    setFormState((current) => ({ ...current, [name]: value }));
  };

  useEffect(() => {
    const key =
      new URLSearchParams(window.location.search).get('authKey') || sessionStorage.getItem('upload_auth') || '';
    setAuthKey(key);
    fetchAdminSession().then(setSession);
  }, []);

  const onPick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPreview(file ? URL.createObjectURL(file) : '');
    geocodeController.current?.abort();
    setPlaceStatus('idle');
    setMetadataChips([]);
    setMetadataDetected(false);
    touched.current.clear();
    setFormState({ collection: 'street' });
    if (!file) return;
    try {
      const metadata = parsePhotoMetadata(new Uint8Array(await file.slice(0, 2 * 1024 * 1024).arrayBuffer()));
      if (!metadata) return;
      const fields = metadataToFormFields(metadata);
      setMetadataDetected(true);
      setMetadataChips(summarizeMetadata(metadata));
      setFormState((current) => {
        const next = { ...current };
        for (const [name, value] of Object.entries(fields)) if (!touched.current.has(name)) next[name] = value;
        return next;
      });
      const coordinates = {
        latitude: metadata.latitude === undefined ? '' : String(metadata.latitude),
        longitude: metadata.longitude === undefined ? '' : String(metadata.longitude),
        altitude: metadata.altitude === undefined ? '' : String(metadata.altitude),
      };
      setFormState((current) => ({
        ...current,
        ...Object.fromEntries(Object.entries(coordinates).filter(([name]) => !touched.current.has(name))),
        ...(metadata.cameraMake ? { cameraMake: metadata.cameraMake } : {}),
        ...(metadata.cameraModel ? { cameraModel: metadata.cameraModel } : {}),
        ...(metadata.lens ? { lens: metadata.lens } : {}),
        ...(metadata.fNumber !== undefined ? { fNumber: String(metadata.fNumber) } : {}),
        ...(metadata.exposureTime ? { exposureTime: metadata.exposureTime } : {}),
        ...(metadata.iso !== undefined ? { iso: String(metadata.iso) } : {}),
        ...(metadata.focalLength !== undefined ? { focalLength: String(metadata.focalLength) } : {}),
        metadataSource: 'exif',
      }));
      if (metadata.latitude !== undefined && metadata.longitude !== undefined && !touched.current.has('location')) {
        const controller = new AbortController();
        geocodeController.current = controller;
        setPlaceStatus('resolving');
        try {
          const query = new URLSearchParams({ lat: String(metadata.latitude), lon: String(metadata.longitude), lang: locale });
          const response = await fetch(`/api/photo-geocode?${query}`, { signal: controller.signal });
          if (!response.ok) throw new Error('geocode unavailable');
          const place = (await response.json()) as { label?: string | null; city?: string | null; region?: string | null; country?: string | null };
          if (!controller.signal.aborted) {
            setFormState((current) => ({
              ...current,
              ...(!touched.current.has('location') && !current.location ? { location: place.label || '' } : {}),
              ...(!touched.current.has('city') && place.city ? { city: place.city } : {}),
              ...(!touched.current.has('region') && place.region ? { region: place.region } : {}),
              ...(!touched.current.has('country') && place.country ? { country: place.country } : {}),
            }));
            setPlaceStatus(place.label ? 'idle' : 'unavailable');
          }
        } catch {
          if (!controller.signal.aborted) setPlaceStatus('unavailable');
        }
      }
    } catch {
      // Unsupported or malformed metadata keeps the manual upload path available.
    }
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get('file');

    if (!(file instanceof File) || file.size === 0) {
      setError(t('photoForm.pickFirst'));
      return;
    }
    if (!session.access && !authKey) {
      setError(t('admin.accessRequired'));
      return;
    }

    setBusy(true);
    setError('');
    setMessage('');

    try {
      if (!session.access) data.set('authKey', authKey);

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

      const response = await fetch('/api/admin/photos', { method: 'POST', body: data });
      if (!response.ok) {
        const payload = (await response.json().catch(() => ({}))) as { error?: string };
        throw new Error(payload.error || `${t('photoForm.uploadFailed')} (${response.status})`);
      }

      form.reset();
      setPreview('');
      setMessage(t('photoForm.uploaded'));
      setFormState({ collection: 'street' });
      setMetadataChips([]);
      setMetadataDetected(false);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t('photoForm.uploadFailed'));
    } finally {
      setBusy(false);
    }
  };

  // Access decides who gets here; asking for a key on top of it would only confuse.
  if (session.access && !session.authenticated) {
    return (
      <main className="profile-shell">
        <header className="brutal-card brutal-card--yellow">
          <p className="brutal-kicker">{t('photography.adminKicker')}</p>
          <h1 className="profile-hero__name">{t('photography.uploadKicker')}</h1>
          <p className="brutal-text">{t('admin.accessRequired')}</p>
        </header>
      </main>
    );
  }

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
          {metadataDetected ? <p className="photo-metadata-note">{t('photoForm.metadataDetected')}{metadataChips.length ? ` · ${metadataChips.join(' · ')}` : ''}</p> : null}
          {!metadataDetected && preview ? <p className="photo-metadata-note">{t('photoForm.metadataNone')}</p> : null}

          <label className="form-field">
            <span>{t('photoForm.title')}</span>
            <input type="text" name="title" value={formState.title || ''} onChange={(event) => updateField('title', event.target.value)} placeholder={t('photoForm.titlePlaceholder')} maxLength={120} />
          </label>

          <label className="form-field">
            <span>{t('photoForm.collection')}</span>
            <input type="text" name="collection" value={formState.collection || ''} onChange={(event) => updateField('collection', event.target.value)} placeholder={t('photoForm.collectionPlaceholder')} maxLength={40} />
          </label>

          <label className="form-field">
            <span>{t('photoForm.takenOn')}</span>
            <input type="date" name="takenOn" value={formState.takenOn || ''} onChange={(event) => updateField('takenOn', event.target.value)} />
          </label>

          <label className="form-field">
            <span>{t('photoForm.tags')}</span>
            <input type="text" name="tags" value={formState.tags || ''} onChange={(event) => updateField('tags', event.target.value)} placeholder="film, 35mm" maxLength={120} />
          </label>

          <label className="form-field">
            <span>{t('photoForm.location')}</span>
            <input type="text" name="location" value={formState.location || ''} onChange={(event) => updateField('location', event.target.value)} placeholder={t('photoForm.locationPlaceholder')} maxLength={160} />
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

        {placeStatus === 'resolving' ? <p className="photo-metadata-note" role="status">{t('photoForm.resolvingPlace')}</p> : null}
        {placeStatus === 'unavailable' ? <p className="photo-metadata-note" role="status">{t('photoForm.placeUnavailable')}</p> : null}

        {['latitude', 'longitude', 'altitude', 'city', 'region', 'country', 'cameraMake', 'cameraModel', 'lens', 'fNumber', 'exposureTime', 'iso', 'focalLength', 'metadataSource'].map((name) => (
          <input key={name} type="hidden" name={name} value={formState[name] || ''} />
        ))}

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
