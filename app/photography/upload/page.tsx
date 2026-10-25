'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { fetchAdminSession, anonymousSession, type AdminSession } from '@/lib/adminSession';
import { metadataToFormFields, parsePhotoMetadata, type PhotoMetadata } from '@/lib/photoMetadata';
import { deleteItem, listItems, saveItem, type PersistedItem } from '@/lib/uploadQueueStore';
import { backoffDelay, classifyFailure, isRetryableStatus, MAX_ATTEMPTS } from '@/lib/uploadRetry';

const PREVIEW_MAX_EDGE = 1600;
const PICK_LIMIT = 30;

type UploadStatus = 'reading' | 'resolving' | 'ready' | 'uploading' | 'retrying' | 'done' | 'error';
type ResolvedPlace = { label?: string | null; city?: string | null; region?: string | null; country?: string | null };
type UploadItem = {
  id: string;
  file: File;
  thumbUrl: string;
  meta: PhotoMetadata | null;
  date: string;
  place: ResolvedPlace | null;
  camera: string;
  collection: string;
  coordinates: { latitude?: number; longitude?: number; altitude?: number };
  status: UploadStatus;
  message: string;
  attempt?: number;
};

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

function mapConcurrent<T>(items: T[], concurrency: number, task: (item: T) => Promise<void>) {
  let next = 0;
  return Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      await task(items[index]);
    }
  }));
}

export default function PhotoUploadPage() {
  const { t, locale } = useLanguage();
  const [authKey, setAuthKey] = useState('');
  const [session, setSession] = useState<AdminSession>(anonymousSession);
  const [queue, setQueue] = useState<UploadItem[]>([]);
  const [busy, setBusy] = useState(false);
  const [tooMany, setTooMany] = useState(false);
  const [summary, setSummary] = useState<{ done: number; failed: number; skipped: number } | null>(null);
  const [restoredCount, setRestoredCount] = useState<number | null>(null);
  const [restoreFailed, setRestoreFailed] = useState(false);
  const [batchStopped, setBatchStopped] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const queueRef = useRef<UploadItem[]>([]);
  const controllersRef = useRef(new Map<string, AbortController>());
  const stoppedRef = useRef(false);

  const updateQueue = (updater: (items: UploadItem[]) => UploadItem[]) => {
    const next = updater(queueRef.current);
    queueRef.current = next;
    setQueue(next);
  };

  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get('authKey') || sessionStorage.getItem('upload_auth') || '';
    setAuthKey(key);
    let active = true;
    fetchAdminSession().then(async (nextSession) => {
      if (!active) return;
      setSession(nextSession);
      try {
        const persisted = await listItems();
        const ready: UploadItem[] = [];
        for (const saved of persisted) {
          if (saved.uploadedId) {
            void deleteItem(saved.id);
            continue;
          }
          ready.push({
            id: saved.id,
            file: new File([saved.blob], saved.name, { type: saved.type, lastModified: saved.lastModified }),
            thumbUrl: URL.createObjectURL(saved.blob),
            meta: saved.meta,
            date: saved.date,
            place: saved.place,
            camera: saved.camera,
            collection: saved.collection,
            coordinates: saved.coordinates,
            status: 'ready',
            message: '',
          });
        }
        if (!active) {
          ready.forEach((item) => URL.revokeObjectURL(item.thumbUrl));
          return;
        }
        if (ready.length) {
          let didRestore = false;
          updateQueue((current) => {
            if (current.length) {
              ready.forEach((item) => URL.revokeObjectURL(item.thumbUrl));
              return current;
            }
            didRestore = true;
            return ready;
          });
          if (didRestore) setRestoredCount(ready.length);
        }
      } catch {
        if (active) setRestoreFailed(true);
      }
    });
    return () => {
      active = false;
      controllersRef.current.forEach((controller) => controller.abort());
      queueRef.current.forEach((item) => URL.revokeObjectURL(item.thumbUrl));
    };
  }, []);

  const persistedItem = (item: UploadItem): PersistedItem => ({
    id: item.id,
    name: item.file.name,
    type: item.file.type,
    size: item.file.size,
    lastModified: item.file.lastModified,
    blob: item.file,
    meta: item.meta,
    date: item.date,
    place: item.place,
    camera: item.camera,
    collection: item.collection,
    coordinates: item.coordinates,
    savedAt: Date.now(),
  });

  const onPick = async (event: ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(event.target.files || []);
    event.target.value = '';
    if (!selected.length) {
      if (queueRef.current.length === 0) setError(t('photoForm.pickFirst'));
      return;
    }

    setError('');
    setSummary(null);
    setBatchStopped(false);
    setRestoredCount(null);
    setTooMany(selected.length > PICK_LIMIT);
    const picked = selected.slice(0, PICK_LIMIT);
    const items: UploadItem[] = picked.map((file) => ({
      id: crypto.randomUUID(), file, thumbUrl: URL.createObjectURL(file), meta: null,
      date: '', place: null, camera: '', collection: 'undated', coordinates: {}, status: 'reading', message: '',
    }));
    updateQueue((current) => {
      current.forEach((item) => {
        URL.revokeObjectURL(item.thumbUrl);
        void deleteItem(item.id);
      });
      return items;
    });

    await mapConcurrent(items, 3, async (item) => {
      try {
        const meta = parsePhotoMetadata(new Uint8Array(await item.file.slice(0, 2 * 1024 * 1024).arrayBuffer()));
        const takenOn = meta?.takenAt || '';
        const camera = meta ? [meta.cameraMake, meta.cameraModel].filter(Boolean).join(' ').replace(/\s+/g, ' ').trim() : '';
        const coordinates = {
          ...(meta?.latitude !== undefined ? { latitude: meta.latitude } : {}),
          ...(meta?.longitude !== undefined ? { longitude: meta.longitude } : {}),
          ...(meta?.altitude !== undefined ? { altitude: meta.altitude } : {}),
        };
        const parsedItem = {
          ...item, meta, date: takenOn, camera,
          collection: takenOn ? takenOn.slice(0, 7) : 'undated', coordinates,
          status: (meta?.latitude !== undefined && meta.longitude !== undefined ? 'resolving' : 'ready') as UploadStatus,
        };
        void saveItem(persistedItem(parsedItem));
        updateQueue((current) => current.map((entry) => entry.id === item.id ? {
          ...entry, meta, date: takenOn, camera,
          collection: takenOn ? takenOn.slice(0, 7) : 'undated', coordinates,
          status: meta?.latitude !== undefined && meta.longitude !== undefined ? 'resolving' : 'ready',
        } : entry));
      } catch {
        const unreadableItem = { ...item, status: 'ready' as const };
        void saveItem(persistedItem(unreadableItem));
        updateQueue((current) => current.map((entry) => entry.id === item.id ? unreadableItem : entry));
      }
    });

    const latest = queueRef.current;
    const locations = new Map<string, UploadItem[]>();
    for (const item of latest) {
      const { latitude, longitude } = item.coordinates;
      if (latitude === undefined || longitude === undefined) continue;
      const key = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
      locations.set(key, [...(locations.get(key) || []), item]);
    }

    let previousRequest = 0;
    for (const [key, members] of Array.from(locations.entries())) {
      const elapsed = Date.now() - previousRequest;
      if (previousRequest && elapsed < 1100) await new Promise((resolve) => setTimeout(resolve, 1100 - elapsed));
      const [latitude, longitude] = key.split(',');
      let place: ResolvedPlace | null = null;
      try {
        const query = new URLSearchParams({ lat: latitude, lon: longitude, lang: locale });
        const response = await fetch(`/api/photo-geocode?${query}`);
        if (!response.ok) throw new Error('geocode unavailable');
        place = await response.json() as ResolvedPlace;
      } catch {
        place = null;
      }
      previousRequest = Date.now();
      const memberIds = new Set(members.map((member: UploadItem) => member.id));
      updateQueue((current) => current.map((entry) => {
        if (!memberIds.has(entry.id)) return entry;
        const resolved = { ...entry, place, status: 'ready' as const };
        void saveItem(persistedItem(resolved));
        return resolved;
      }));
    }
    updateQueue((current) => current.map((entry) => entry.status === 'resolving' ? { ...entry, status: 'ready' } : entry));
  };

  const startBatch = async (requested: UploadItem[]) => {
    if (requested.length === 0) {
      setError(t('photoForm.pickFirst'));
      return;
    }
    if (!session.access && !authKey) {
      setError(t('admin.accessRequired'));
      return;
    }

    setBusy(true);
    setError('');
    setSummary(null);
    setRestoredCount(null);
    setBatchStopped(false);
    stoppedRef.current = false;
    let done = 0;
    let failed = 0;
    const items = requested;
    await mapConcurrent(items, 2, async (item) => {
      if (stoppedRef.current) return;
      if (!queueRef.current.some((entry) => entry.id === item.id)) return;
      let completed = false;
      for (let attempt = 1; attempt <= MAX_ATTEMPTS && !completed; attempt += 1) {
        if (stoppedRef.current) break;
        const controller = new AbortController();
        controllersRef.current.set(item.id, controller);
        updateQueue((current) => current.map((entry) => entry.id === item.id ? {
          ...entry, status: attempt === 1 ? 'uploading' : 'retrying', message: '', attempt,
        } : entry));
        try {
          const data = new FormData();
          data.set('file', item.file);
          data.set('title', '');
          for (const [name, value] of Object.entries(metadataToFormFields(item.meta || { keywords: [] }))) data.set(name, value);
          const place = item.place;
          const locationLabel = place?.label || [place?.city, place?.region, place?.country].filter(Boolean).join(', ');
          if (locationLabel) data.set('location', locationLabel);
          if (place?.city) data.set('city', place.city);
          if (place?.region) data.set('region', place.region);
          if (place?.country) data.set('country', place.country);
          if (item.coordinates.latitude !== undefined) data.set('latitude', String(item.coordinates.latitude));
          if (item.coordinates.longitude !== undefined) data.set('longitude', String(item.coordinates.longitude));
          if (item.coordinates.altitude !== undefined) data.set('altitude', String(item.coordinates.altitude));
          data.set('takenOn', item.date);
          data.set('collection', item.collection);
          data.set('metadataSource', 'exif');
          if (!session.access) data.set('authKey', authKey);

          const bitmap = await createImageBitmap(item.file);
          data.set('width', String(bitmap.width));
          data.set('height', String(bitmap.height));
          try {
            const preview = await renderPreview(bitmap);
            if (preview) data.set('preview', preview, 'preview.webp');
          } finally {
            bitmap.close();
          }
          const response = await fetch('/api/admin/photos', { method: 'POST', body: data, signal: controller.signal });
          if (!response.ok) {
            const payload = await response.json().catch(() => ({})) as { error?: string };
            const failure = new Error(payload.error || `${t('photoForm.uploadFailed')} (${response.status})`) as Error & { status: number; retryAfter?: number };
            failure.status = response.status;
            const retryAfter = response.headers.get('Retry-After');
            if (retryAfter) failure.retryAfter = Number(retryAfter);
            throw failure;
          }
          completed = true;
          done += 1;
          updateQueue((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: 'done', message: '', attempt: undefined } : entry));
          const removed = await deleteItem(item.id);
          if (!removed) void saveItem({ ...persistedItem(item), uploadedId: item.id });
        } catch (cause) {
          if (controller.signal.aborted || stoppedRef.current || (cause instanceof Error && cause.name === 'AbortError')) {
            updateQueue((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: 'ready', message: '', attempt: undefined } : entry));
            break;
          }
          const retryable = classifyFailure(cause) === 'retryable';
          if (!retryable || attempt >= MAX_ATTEMPTS) {
            failed += 1;
            const itemMessage = cause instanceof Error ? cause.message : t('photoForm.uploadFailed');
            updateQueue((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: 'error', message: itemMessage, attempt: undefined } : entry));
            break;
          }
          const retryAfter = (cause as { retryAfter?: number }).retryAfter;
          const delay = (cause as { status?: number }).status === 429 && Number.isFinite(retryAfter)
            ? Math.min(30000, Math.max(0, (retryAfter as number) * 1000))
            : backoffDelay(attempt);
          updateQueue((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: 'retrying', attempt: attempt + 1 } : entry));
          try {
            await new Promise<void>((resolve, reject) => {
              const timer = window.setTimeout(resolve, delay);
              controller.signal.addEventListener('abort', () => {
                window.clearTimeout(timer);
                reject(new DOMException('Upload stopped', 'AbortError'));
              }, { once: true });
            });
          } catch {
            updateQueue((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: 'ready', message: '', attempt: undefined } : entry));
            break;
          }
        } finally {
          controllersRef.current.delete(item.id);
        }
      }
    });
    const skipped = stoppedRef.current ? queueRef.current.filter((item) => item.status === 'ready').length : 0;
    setSummary({ done, failed, skipped });
    setBusy(false);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (queueRef.current.length === 0) {
      setError(t('photoForm.pickFirst'));
      return;
    }
    if (!session.access && !authKey) {
      setError(t('admin.accessRequired'));
      return;
    }
    void startBatch(queueRef.current.filter((item) => item.status === 'ready'));
  };

  const retryOne = (item: UploadItem) => {
    if (!session.access && !authKey) {
      setError(t('admin.accessRequired'));
      return;
    }
    void startBatch([item]);
  };

  const stopBatch = () => {
    stoppedRef.current = true;
    setBatchStopped(true);
    controllersRef.current.forEach((controller) => controller.abort());
  };

  const clearFinished = () => updateQueue((current) => {
    const finished = current.filter((item) => item.status === 'done');
    finished.forEach((item) => {
      URL.revokeObjectURL(item.thumbUrl);
      void deleteItem(item.id);
    });
    return current.filter((item) => item.status !== 'done');
  });

  const removeItem = (id: string) => updateQueue((current) => {
    const removed = current.find((item) => item.id === id);
    if (removed) URL.revokeObjectURL(removed.thumbUrl);
    void deleteItem(id);
    return current.filter((item) => item.id !== id);
  });

  // Access decides who gets here; asking for a key on top of it would only confuse.
  if (session.access && !session.authenticated) {
    return (
      <main className="profile-shell">
        <header className="brutal-card brutal-card--yellow">
          <p className="brutal-kicker">{t('photography.adminKicker')}</p>
          <h1 className="profile-hero__name">{t('photography.uploadKicker')}</h1>
          <p className="brutal-text">{t('admin.sessionExpired')}</p>
          <div className="profile-hero__actions">
            <button className="brutal-btn brutal-btn--ink" type="button" onClick={() => window.location.reload()}>
              {t('admin.reauthenticate')}
            </button>
          </div>
        </header>
      </main>
    );
  }

  return (
    <main className="profile-shell">
      <header className="brutal-card brutal-card--yellow">
        <p className="brutal-kicker">{t('photography.adminKicker')}</p>
        <h1 className="profile-hero__name">{t('photography.uploadKicker')}</h1>
        <p className="profile-hero__tagline">{t('photography.uploadTagline')}</p>
        <div className="profile-hero__actions">
          <Link className="brutal-btn" href="/photography">{t('photography.backToGallery')}</Link>
        </div>
      </header>

      {error ? <div className="profile-callout" role="alert"><span>{error}</span></div> : null}
      <div className="upload-notes" aria-live="polite">
        {tooMany ? <p className="photo-metadata-note" role="status">{t('photoForm.tooMany')}</p> : null}
        {summary ? <p className="photo-metadata-note" role="status">{t('photoForm.uploadSummary', { done: String(summary.done), failed: String(summary.failed), skipped: String(summary.skipped) })}</p> : null}
        {restoreFailed ? <p className="photo-metadata-note" role="status">{t('photoForm.restoreFailed')}</p> : null}
        {batchStopped ? <p className="photo-metadata-note" role="status">{t('photoForm.stopped')}</p> : null}
      </div>

      <form className="brutal-card profile-section" onSubmit={onSubmit}>
        <div className="upload-picker">
          <input
            ref={inputRef}
            className="upload-picker__input"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            multiple
            disabled={busy || queue.some((item) => item.status === 'reading' || item.status === 'resolving')}
            onChange={onPick}
            aria-label={t('photoForm.file')}
          />
          <button className="brutal-btn" type="button" disabled={busy || queue.some((item) => item.status === 'reading' || item.status === 'resolving')} onClick={() => inputRef.current?.click()}>
            {t('photoForm.chooseFiles')}
          </button>
        </div>

        {restoredCount !== null ? (
          <div className="upload-notes" aria-live="polite">
            <p className="photo-metadata-note" role="status">{t('photoForm.queueRestored', { count: String(restoredCount) })}</p>
          </div>
        ) : null}
        <div className="profile-hero__actions">
          {queue.some((item) => item.status === 'error') ? (
            <button className="brutal-btn" type="button" disabled={busy} onClick={() => void startBatch(queueRef.current.filter((item) => item.status === 'error'))}>
              {t('photoForm.retryFailed', { count: String(queue.filter((item) => item.status === 'error').length) })}
            </button>
          ) : null}
          {busy ? <button className="brutal-btn" type="button" onClick={stopBatch}>{t('photoForm.stop')}</button> : null}
          {queue.some((item) => item.status === 'done') ? <button className="brutal-btn" type="button" disabled={busy} onClick={clearFinished}>{t('photoForm.clearFinished')}</button> : null}
        </div>

        {queue.length ? (
          <div className="upload-queue" aria-live="polite">
            {queue.map((item) => {
              const coordinateLabel = item.coordinates.latitude !== undefined && item.coordinates.longitude !== undefined
                ? `${item.coordinates.latitude}, ${item.coordinates.longitude}`
                : '';
              const facts = [item.date || t('photoForm.untitledCollection'), item.place?.label || item.place?.city || coordinateLabel, item.camera]
                .filter(Boolean).join(' · ');
              const statusKey: Record<UploadStatus, string> = {
                reading: 'photoForm.statusReading', resolving: 'photoForm.resolvingPlace', ready: 'photoForm.statusReady',
                uploading: 'photoForm.statusUploading', retrying: 'photoForm.statusRetrying', done: 'photoForm.statusDone', error: 'photoForm.statusError',
              };
              return (
                <div className="upload-queue__row" key={item.id}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={item.thumbUrl} alt="" />
                  <div className="upload-queue__details">
                    <span className="upload-queue__facts">{facts || t('photoForm.queueEmpty')}</span>
                    <span className={`upload-queue__status upload-queue__status--${item.status}`}>{item.status === 'retrying'
                      ? t(statusKey[item.status], { attempt: String(item.attempt || 1), max: String(MAX_ATTEMPTS) })
                      : t(statusKey[item.status])}</span>
                    {item.message ? <span className="upload-queue__message" role="alert">{item.message}</span> : null}
                  </div>
                  {item.status === 'error' ? <button type="button" onClick={() => retryOne(item)} disabled={busy}>{t('photoForm.retry')}</button> : null}
                  <button type="button" aria-label={t('photoForm.remove')} disabled={item.status === 'uploading' || item.status === 'retrying'} onClick={() => removeItem(item.id)}>×</button>
                </div>
              );
            })}
          </div>
        ) : <p className="photo-metadata-note">{t('photoForm.queueEmpty')}</p>}

        <div className="profile-hero__actions">
          <button className="brutal-btn brutal-btn--ink" type="submit" disabled={queue.length === 0 || busy || queue.every((item) => item.status !== 'ready') || queue.some((item) => item.status === 'reading' || item.status === 'resolving')}>
            {busy ? t('photoForm.uploading') : t('photoForm.uploadAll', { count: String(queue.filter((item) => item.status === 'ready').length) })}
          </button>
        </div>
      </form>
    </main>
  );
}
