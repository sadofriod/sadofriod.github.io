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
  const [place, setPlace] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    const key = new URLSearchParams(window.location.search).get('authKey');
    if (key) sessionStorage.setItem('upload_auth', key);

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

  const places = useMemo(() => {
    const counts = new Map<string, number>();
    for (const photo of photos) {
      const name = photo.location?.city || photo.location?.label;
      if (name) counts.set(name, (counts.get(name) || 0) + 1);
    }
    return Array.from(counts.entries()).sort(([nameA, countA], [nameB, countB]) => countB - countA || nameA.localeCompare(nameB));
  }, [photos]);

  const visible = useMemo(
    () => photos.filter((photo) =>
      (collection === 'all' || photo.collection === collection) &&
      (place === 'all' || (photo.location?.city || photo.location?.label) === place)
    ),
    [photos, collection, place]
  );

  return (
    <main className="profile-shell">
      <header className="brutal-card brutal-card--blue">
        <p className="brutal-kicker">{t('photography.kicker')}</p>
        <h1 className="profile-hero__name">{t('photography.title')}</h1>
        <p className="profile-hero__tagline">
          {t('photography.tagline')}
        </p>
        <div className="profile-hero__actions">
          <Link className="brutal-btn" href="/photography/verify">{t('watermark.title')}</Link>
          <Link className="brutal-btn brutal-btn--ink" href="/photography/upload">{t('photography.uploadCta')}</Link>
        </div>
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

      <div className="photo-toolbar photo-toolbar--places" aria-label={t('photography.byPlace')}>
        <button type="button" className="photo-chip" aria-pressed={place === 'all'} onClick={() => setPlace('all')}>
          {t('photography.allPlaces')} ({photos.length})
        </button>
        {places.map(([name, count]) => (
          <button key={name} type="button" className="photo-chip" aria-pressed={place === name} onClick={() => setPlace(name)}>
            {name} ({count})
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
          <a
            key={photo.id}
            href={`/photography/${photo.id}`}
            className="photo-tile"
            onClick={(event) => {
              if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
              event.preventDefault();
              setOpenIndex(index);
            }}
            aria-label={t('photography.openTitle', { title: photo.title || photo.location?.city || photo.takenOn || t('photography.untitled') })}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl(photo, 800)}
              alt={photo.title || [photo.location?.city || photo.location?.label, photo.takenOn].filter(Boolean).join(' · ') || 'Untitled photo'}
              {...(index === 0 ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const })}
              width={photo.width || undefined}
              height={photo.height || undefined}
              style={{ aspectRatio: photo.aspect ? String(photo.aspect) : undefined }}
            />
            <span className="photo-tile__caption">
              <span>{photo.title || photo.location?.city || photo.takenOn || t('photography.untitled')}</span>
              <span className="bento__count">{photo.collection}</span>
              {(photo.location?.city || photo.location?.label) &&
              (photo.title || photo.location?.city || photo.takenOn || t('photography.untitled')) !== (photo.location?.city || photo.location?.label) ? (
                <span className="photo-tile__place">{photo.location.city || photo.location.label}</span>
              ) : null}
            </span>
          </a>
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
