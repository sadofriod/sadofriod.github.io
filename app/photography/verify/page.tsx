'use client';

import Link from 'next/link';
import { useState, type ChangeEvent } from 'react';
import { useLanguage } from '@/lib/i18n/LanguageContext';
import { scanWatermark } from '@/lib/watermark';
import type { Photo } from '@/lib/photos';

export default function VerifyPhotoPage() {
  const { t } = useLanguage();
  const [status, setStatus] = useState('');
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [busy, setBusy] = useState(false);

  const verify = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    setPhoto(null);
    if (!file) return;
    setBusy(true);
    setStatus(t('watermark.scanning'));
    try {
      const bitmap = await createImageBitmap(file);
      const canvas = document.createElement('canvas');
      canvas.width = bitmap.width;
      canvas.height = bitmap.height;
      const context = canvas.getContext('2d', { willReadFrequently: true });
      if (!context) throw new Error('Canvas unavailable');
      context.drawImage(bitmap, 0, 0);
      bitmap.close();
      const result = scanWatermark(context.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height, 4);
      if (!result.crcOk) {
        setStatus(t('watermark.none'));
        return;
      }
      const response = await fetch(`/api/photos?watermark=${encodeURIComponent(result.idHex)}`);
      if (!response.ok) {
        setStatus(t('watermark.none'));
        return;
      }
      const matched = await response.json() as Photo;
      setPhoto(matched);
      setStatus(`${t('watermark.found')} · ${result.confidence.toFixed(2)}`);
    } catch {
      setStatus(t('watermark.failed'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="profile-shell">
      <header className="brutal-card brutal-card--blue">
        <p className="brutal-kicker">{t('watermark.kicker')}</p>
        <h1 className="profile-hero__name">{t('watermark.title')}</h1>
        <p className="brutal-text">{t('watermark.description')}</p>
        <div className="profile-hero__actions"><Link className="brutal-btn" href="/photography">{t('photography.backToGallery')}</Link></div>
      </header>
      <section className="brutal-card profile-section">
        <div className="upload-picker">
          <label className="brutal-btn" htmlFor="watermark-image">{t('watermark.choose')}</label>
          <input id="watermark-image" className="upload-picker__input" type="file" accept="image/*" onChange={verify} disabled={busy} />
        </div>
        <p className="brutal-text" role="status" aria-live="polite">{status}</p>
        {photo ? <article>
          <h2 className="brutal-title">{photo.title || t('photography.untitled')}</h2>
          <p className="brutal-text">{[photo.takenOn, photo.location?.label || photo.location?.city].filter(Boolean).join(' · ')}</p>
          <Link className="brutal-link" href="/photography">{t('watermark.openGallery')}</Link>
        </article> : null}
      </section>
    </main>
  );
}
