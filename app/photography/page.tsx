'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import PhotoLightbox from '@/components/PhotoLightbox';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { previewUrl, type Photo, type PhotoCollection } from '@/lib/photos';

export default function PhotographyPage() {
  const { t } = useLanguage();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [collections, setCollections] = useState<PhotoCollection[]>([]);
  const [collection, setCollection] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get('authKey');
    if (key) sessionStorage.setItem('upload_auth', key);
    setIsAdmin(Boolean(key || sessionStorage.getItem('upload_auth')));

    let cancelled = false;

    const load = async () => {
      try {
        const [photosResponse, collectionsResponse] = await Promise.all([
          fetch('/api/photos'),
          fetch('/api/photo-collections'),
        ]);
        if (!photosResponse.ok) throw new Error('Could not load photos');

        const photoList = (await photosResponse.json()) as Photo[];
        const collectionList = collectionsResponse.ok ? ((await collectionsResponse.json()) as PhotoCollection[]) : [];
        if (cancelled) return;

        setPhotos(photoList);
        setCollections(collectionList);
      } catch (cause) {
        if (!cancelled) setError(cause instanceof Error ? cause.message : 'Could not load photos');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(
    () => (collection === 'all' ? photos : photos.filter((photo) => photo.collection === collection)),
    [photos, collection]
  );

  return (
    <main className="profile-shell">
      <header className="brutal-card brutal-card--blue">
        <p className="brutal-kicker">{t('photography.kicker')}</p>
        <h1 className="profile-hero__name">{t('photography.title')}</h1>
        <p className="profile-hero__tagline">
          {t('photography.tagline')}
        </p>
        {isAdmin ? (
          <div className="profile-hero__actions">
            <Link className="brutal-btn brutal-btn--ink" href="/photography/upload">
              {t('photography.uploadCta')}
            </Link>
          </div>
        ) : null}
      </header>

      <div className="photo-toolbar">
        <button
          type="button"
          className="photo-chip"
          aria-pressed={collection === 'all'}
          onClick={() => setCollection('all')}
        >
          {t('photography.all')} ({photos.length})
        </button>
        {collections.map((entry) => (
          <button
            key={entry.collection}
            type="button"
            className="photo-chip"
            aria-pressed={collection === entry.collection}
            onClick={() => setCollection(entry.collection)}
          >
            {entry.collection} ({entry.count})
          </button>
        ))}
      </div>

      {error ? (
        <div className="profile-callout" role="alert">
          <span className="brutal-kicker">{t('photography.gallery')}</span>
          <span>{error}</span>
        </div>
      ) : null}

      {loading ? <p className="brutal-kicker">{t('photography.loading')}</p> : null}

      {!loading && !error && visible.length === 0 ? (
        <div className="photo-empty">
          <p className="brutal-kicker">{t('photography.empty')}</p>
          <p className="brutal-text">
            {t('photography.emptyLead')}{' '}
            <Link className="brutal-link" href="/photography/upload">{t('photography.uploadLink')}</Link>.
          </p>
        </div>
      ) : null}

      <div className="photo-grid">
        {visible.map((photo, index) => (
          <button
            key={photo.id}
            type="button"
            className="photo-tile"
            onClick={() => setOpenIndex(index)}
            aria-label={t('photography.openTitle', { title: photo.title || t('photography.untitled') })}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl(photo, 800)}
              alt={photo.title || ''}
              loading="lazy"
              width={photo.width || undefined}
              height={photo.height || undefined}
            />
            <span className="photo-tile__caption">
              <span>{photo.title || t('photography.untitled')}</span>
              <span className="bento__count">{photo.collection}</span>
            </span>
          </button>
        ))}
      </div>

      <PhotoLightbox
        photos={visible}
        index={openIndex}
        onClose={() => setOpenIndex(null)}
        onNavigate={setOpenIndex}
      />
    </main>
  );
}
