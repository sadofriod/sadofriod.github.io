'use client';

import { useCallback, useEffect } from 'react';
import type { Photo } from '@/lib/photos';

type PhotoLightboxProps = {
  photos: Photo[];
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
};

export default function PhotoLightbox({ photos, index, onClose, onNavigate }: PhotoLightboxProps) {
  const photo = index !== null ? photos[index] : undefined;

  const step = useCallback(
    (delta: number) => {
      if (index === null || photos.length === 0) return;
      onNavigate((index + delta + photos.length) % photos.length);
    },
    [index, photos.length, onNavigate]
  );

  useEffect(() => {
    if (!photo) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };

    window.addEventListener('keydown', onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [photo, onClose, step]);

  if (!photo) return null;

  return (
    <div
      className="photo-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={photo.title || 'Photo'}
      onClick={onClose}
    >
      <figure className="photo-lightbox__figure" onClick={(event) => event.stopPropagation()}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`${photo.preview}?w=2000`} alt={photo.title || ''} />
        <figcaption className="photo-lightbox__bar">
          <span>
            {photo.title || 'Untitled'}
            {photo.takenOn ? ` · ${photo.takenOn}` : ''}
            {photo.width && photo.height ? ` · ${photo.width}×${photo.height}` : ''}
          </span>
          <span className="photo-lightbox__actions">
            <button type="button" onClick={() => step(-1)} aria-label="Previous photo">
              ←
            </button>
            <button type="button" onClick={() => step(1)} aria-label="Next photo">
              →
            </button>
            <a href={photo.original} download>
              Download original
            </a>
            <button type="button" onClick={onClose}>
              Close
            </button>
          </span>
        </figcaption>
      </figure>
    </div>
  );
}
